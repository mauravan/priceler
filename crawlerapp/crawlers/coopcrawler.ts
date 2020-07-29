import { Crawler, CRAWLERTYPE } from "./crawler";
import {
  normalizedPrice,
  onlyNumbersParsingToInt,
  Stopwatch,
  STOPWATCH_FORMAT,
  withoutLeadingAndTrailingWhitespace,
} from "../../config/helpers";
import { goToPageReturningDom } from "../jsdom/jsdomHelper";
import {
  autoScroll,
  closeBrowser,
  initializeBrowser,
  navigateToUrl,
  openNewPage,
} from "../puppeteer/priclerPuppeteer";
import { Browser, Page } from "puppeteer";
import { Product, RETAILER } from "../../types/types";
import { createOrUpdateProduct } from "../db/products.database";

const clickSeeAllButtonFromDom = (dom: Document): void =>
  (dom.querySelector(
    "a.cmsTeaserRow-controls__see-all"
  ) as HTMLAnchorElement).click();
const getCoopCarouselContainigLinks = (
  dom: Document
): NodeListOf<HTMLLIElement> =>
  dom.querySelectorAll("div.cmsList.cmsList--link>ul.cmsList__list");
const getCoopLinksFromContainer = (el: Element) =>
  el.querySelectorAll("a.cmsList__itemLink");
const listPageTriggerPresent = () =>
  document.querySelector("a.list-page__trigger") != null &&
  // @ts-ignore
  document.querySelector("a.list-page__trigger").style.display !== "none";
const clickListPageTrigger = () =>
  // @ts-ignore
  document.querySelector(".list-page__trigger").click();

export class Coopcrawler implements Crawler {
  constructor(
    private type: CRAWLERTYPE,
    private baseUrl: string,
    private pageUrl: string
  ) {}

  async getCategoryUrls(): Promise<Array<{ url: string; cat: string }>> {
    const dom = await goToPageReturningDom(this.baseUrl);
    clickSeeAllButtonFromDom(dom);
    return Array.from(getCoopCarouselContainigLinks(dom))
      .reduce(
        (acc, curr) => [...acc, ...Array.from(getCoopLinksFromContainer(curr))],
        []
      )
      .map((el) => ({ url: el.href, cat: el.text }));
  }

  async loadAllProductsToDom(page: Page) {
    try {
      await autoScroll(page);
      // @ts-ignore
      while (await page.evaluate(listPageTriggerPresent)) {
        await page.evaluate(clickListPageTrigger);
        await autoScroll(page);
      }
    } catch (e) {
      console.log("error trying to autoscroll - continuing", e);
    }
  }

  // Run in Browser context
  mapCoopDivResultToProduct(divs: Array<HTMLDivElement>) {
    const safeQueryInnerHtml = (element: Element, query: string): string => {
      const maybeElement = element.querySelector(query);
      if (maybeElement) {
        return maybeElement.innerHTML;
      }
      return "";
    };

    return divs.map((div) => {
      // @ts-ignore
      const isPromoted =
        div.querySelector(
          "dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save"
        ) != null &&
        div.querySelector(
          "dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save"
          // @ts-ignore
        ).style.display !== "none";
      let price;
      let original_price = "";
      if (isPromoted) {
        price = safeQueryInnerHtml(
          div,
          "dd.productTile__price-value.productTile__price-value-lead.productTile__price-value-lead--marked"
        );
        original_price = safeQueryInnerHtml(
          div,
          "dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save"
        );
      } else {
        price = safeQueryInnerHtml(
          div,
          "dd.productTile__price-value.productTile__price-value-lead"
        );
      }

      return {
        externalId: parseInt(div.querySelector("a.productTile ").id),
        name: safeQueryInnerHtml(div, "p.productTile-details__name-value"),
        prices: [
          {
            price,
            original_price,
            quantity: safeQueryInnerHtml(
              div,
              "span.productTile__quantity-text"
            ),
          },
        ],
      };
    });
  }

  // Quantity: 190g, 2x&nbsp;125g, 1.1kg, 500ml, 6ST, 2x 150g
  parseQuantityAndUnit(quantity: string) {
    if (!quantity) {
      return {
        quantity: 0,
        unit: "",
      };
    }
    // ["190", "g"], ["2", "x", "&", "nbsp;", "125", "g"], ["1.1", "kg"], ["6", "ST"], ["2", "x ", "150", "g"]
    const splitValues = quantity.match(/[a-z|;|\s]+|[^a-z|;|\s]+/gi);
    const unit = splitValues[splitValues.length - 1];
    if (splitValues.length > 2) {
      const multiplier = parseInt(splitValues[0]);
      const quantityAsString = splitValues[splitValues.length - 2];
      if (quantityAsString.includes(".")) {
        const parsedQuantityFloat = parseFloat(quantityAsString);
        return {
          quantity: multiplier * parsedQuantityFloat,
          unit: unit,
        };
      }
      const parsedQuantityInt = parseInt(quantityAsString);
      return {
        quantity: multiplier * parsedQuantityInt,
        unit: unit,
      };
    }
    const quantityAsString = splitValues[0];
    if (quantityAsString.includes(".")) {
      const quantityAsFloat = parseFloat(quantityAsString);
      return {
        quantity: quantityAsFloat,
        unit: unit,
      };
    }
    const quantitAsInt = parseInt(quantityAsString);
    return {
      quantity: quantitAsInt,
      unit: unit,
    };
  }

  async loadProductsPerCategory(
    { url, cat }: { url: string; cat: string },
    browser: Browser
  ): Promise<Array<Product>> {
    const productsAsHTML = await this.readProductsFromDom(browser, url);
    return productsAsHTML.map(this.mapHTMLProductToProduct(cat));
  }

  private mapHTMLProductToProduct(cat: string) {
    return (productAsHTML: any) => {
      const price = productAsHTML.prices[0];
      const { quantity, unit } = this.parseQuantityAndUnit(
        withoutLeadingAndTrailingWhitespace(price.quantity)
      );
      const priceAsInt = onlyNumbersParsingToInt(price.price);
      return {
        name: productAsHTML.name,
        externalId: productAsHTML.externalId,
        retailer: RETAILER.COOP,
        category: cat,
        prices: [
          {
            date: new Date(),
            quantity: quantity,
            price: priceAsInt,
            original_price: onlyNumbersParsingToInt(price.original_price),
            unit: unit,
            normalized_price: normalizedPrice(priceAsInt, quantity),
          },
        ],
      };
    };
  }

  private async readProductsFromDom(browser: Browser, url: string) {
    const page = await openNewPage(browser);
    await navigateToUrl(page, url, browser);
    await this.loadAllProductsToDom(page);
    const productsAsHTML = await page.$$eval(
      "div.productTile__wrapper",
      this.mapCoopDivResultToProduct
    );

    await page.close();
    return productsAsHTML;
  }

  // JSDOM
  async readCategoriesFromUrlWithoutDuplicates() {
    const coopCategoryUrls = await this.getCategoryUrls();
    const alreadyContainedCategory: Array<string> = [];
    return coopCategoryUrls.filter(({ url }) => {
      if (alreadyContainedCategory.includes(url)) {
        return false;
      }
      alreadyContainedCategory.push(url);
      return true;
    });
  }

  async crawl(amountOfPages: number): Promise<void> {
    console.log("starting crawler: ", this.type);
    const stopwatch = new Stopwatch();

    let browser = await initializeBrowser();
    const categoriesWithoutDuplicates = await this.readCategoriesFromUrlWithoutDuplicates();
    const maxPages = categoriesWithoutDuplicates.length;

    console.log("Found categories: ", categoriesWithoutDuplicates);

    for (let i = 0; i < maxPages && i < amountOfPages; i++) {
      try {
        const productsByCategory = await this.loadProductsPerCategory(
          categoriesWithoutDuplicates[i],
          browser
        );
        productsByCategory.forEach(createOrUpdateProduct);
      } catch (e) {
        console.log("error in loading products to dom, ", e);
        console.log("retrying:", i--);
      }
    }

    await closeBrowser(browser);
    console.log(
      `${this.type} done in ${stopwatch.stopTimer(
        STOPWATCH_FORMAT.SECS
      )} seconds`
    );
  }
}
