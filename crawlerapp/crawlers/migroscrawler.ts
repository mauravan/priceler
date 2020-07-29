import {
  autoScroll,
  closeBrowser,
  closePage,
  initializeBrowser,
  navigateToUrl,
  openNewPage,
} from "../puppeteer/priclerPuppeteer";
import {
  isOnlyWhitespace,
  normalizedPrice,
  onlyNumbersParsingToInt,
  retryAble,
  Stopwatch,
  STOPWATCH_FORMAT,
  withoutHTMLTags,
} from "../../config/helpers";
import { Crawler, CRAWLERTYPE } from "./crawler";
import { Browser } from "puppeteer";
import { MigrosArticle, Product, RETAILER } from "../../types/types";
import { createOrUpdateProduct } from "../db/products.database";

export const migrosLastButtonSelector =
  'button[data-testid="msrc-articles--pagination-link-last-page"]';

async function loadDataFromNetwork(
  url: string,
  browser: Browser
): Promise<Array<MigrosArticle>> {
  const page = await openNewPage(browser);

  return new Promise(async (resolve, reject) => {
    page.on("response", async (response) => {
      if (response.status() === 500) {
        reject(response);
      }
      if (
        response
          .url()
          .includes("web-api.migros.ch/widgets/product_fragments_json")
      ) {
        const data = <Array<MigrosArticle>>await response.json();
        resolve(data);
        await closePage(page);
      }
    });
    await navigateToUrl(page, url, browser);
  });
}

function extractPrice(product: MigrosArticle): number {
  const metaPrice = product.meta?.price;
  const priceInfoPrice = product.price_info?.price;
  if (metaPrice) {
    return metaPrice;
  }
  if (priceInfoPrice) {
    return onlyNumbersParsingToInt(priceInfoPrice);
  }
  return 0;
}

function extractOriginalPrice(product: MigrosArticle): number {
  const metaPrice = product.meta?.original_price;
  const priceInfoPrice = product.price_info?.original_price;
  if (metaPrice) {
    return metaPrice;
  }
  if (priceInfoPrice) {
    return onlyNumbersParsingToInt(priceInfoPrice);
  }
  return null;
}

function extractQuantityAndUnit(quantityText: string) {
  if (!quantityText || isOnlyWhitespace(quantityText)) {
    return {
      quantity: 1,
      unit: "",
    };
  }

  const [quantityAndUnit] = quantityText.replace(".", "").split(",", 1);
  const splitNumberAndUnit = /[a-z|ü]+|[^a-z|\s]+/gi;
  const quantityAndUnitSeparated = quantityAndUnit.match(splitNumberAndUnit);

  if (quantityAndUnitSeparated) {
    // 3 x 38g
    if (quantityAndUnitSeparated.length > 2) {
      const multiplier = parseInt(quantityAndUnitSeparated[0]);
      const unit =
        quantityAndUnitSeparated[quantityAndUnitSeparated.length - 1];
      const quantity = parseFloat(
        quantityAndUnitSeparated[quantityAndUnitSeparated.length - 2]
      );
      return {
        quantity: multiplier * quantity,
        unit: unit,
      };
    }

    const quantity = parseFloat(quantityAndUnitSeparated[0]);
    const unit = quantityAndUnitSeparated[1];

    return {
      quantity: quantity,
      unit: unit,
    };
  }

  console.log(
    "Could not separate quantity and unit: ",
    quantityText,
    " -> ",
    quantityAndUnit,
    " -> ",
    quantityAndUnitSeparated
  );

  return {
    quantity: 1,
    unit: "",
  };
}

export function mapMigrosArticleToProduct(article: MigrosArticle): Product {
  const quantityText = withoutHTMLTags(
    article.price_info?.quantity || article.product_tile_infos?.price_sub_text
  );
  const { quantity, unit } = extractQuantityAndUnit(quantityText);
  const price = extractPrice(article);
  return {
    externalId: article.id,
    name: article.name,
    retailer: RETAILER.MIGROS,
    category: article.categories[1]?.name,
    prices: [
      {
        date: new Date(),
        price: price,
        original_price: extractOriginalPrice(article),
        quantity: quantity,
        unit: unit,
        normalized_price: normalizedPrice(price, quantity),
      },
    ],
  };
}

async function getMaxPages(url: string, selector: string, browser: Browser) {
  const page = await openNewPage(browser);
  await navigateToUrl(page, url, browser);
  await autoScroll(page);
  const maxPages = await page.$eval(
    selector,
    (el: HTMLButtonElement) => el.innerText
  );
  await closePage(page);
  return maxPages;
}

export class Migroscrawler implements Crawler {
  constructor(
    private type: CRAWLERTYPE,
    private baseUrl: string,
    private pageUrl: string
  ) {}

  async crawl(amountOfPages: number): Promise<void> {
    console.log("starting crawler: ", this.type);
    const stopwatch = new Stopwatch();
    const browser = await initializeBrowser();

    const maxPages = parseInt(
      await getMaxPages(this.baseUrl, migrosLastButtonSelector, browser)
    );

    console.log("Found pages: ", maxPages);

    for (let i = 1; i <= maxPages && i <= amountOfPages; i++) {
      // Fills up combinedMigrosData array
      const migrosArticles = await retryAble(() =>
        loadDataFromNetwork(`${this.baseUrl}${this.pageUrl}${i}`, browser)
      );
      if (!Array.isArray(migrosArticles)) {
        console.log("not an array: ", migrosArticles);
        continue;
      }
      await Promise.all(
        migrosArticles.map(mapMigrosArticleToProduct).map(createOrUpdateProduct)
      );
    }
    await closeBrowser(browser);
    console.log(
      `${this.type} done in ${stopwatch.stopTimer(
        STOPWATCH_FORMAT.SECS
      )} seconds`
    );
  }
}
