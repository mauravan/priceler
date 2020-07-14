import {MigrosArticle, Product, RETAILER} from "../config/types";
import {createOrUpdateProduct} from "../db/database";
import {
    autoScroll,
    closeBrowser,
    closePage,
    initializeBrowser,
    navigateToUrl,
    openNewPage,
} from "../puppeteer/priclerPuppeteer";
import {onlyNumbersParsingToInt, Stopwatch, STOPWATCH_FORMAT, withoutHTMLTags} from "../config/helpers";
import {Crawler, CRAWLERTYPE} from "./crawler";

export const migrosLastButtonSelector = 'button[data-testid="msrc-articles--pagination-link-last-page"]';

async function loadDataFromNetwork(url: string): Promise<Array<MigrosArticle>> {
    const page = await openNewPage();

    return new Promise((async resolve => {
        page.on('response', async response => {
            if (response.url().includes("web-api.migros.ch/widgets/product_fragments_json")) {
                const data = <Array<MigrosArticle>>await response.json();
                resolve(data)
                closePage(page);
            }
        });
        await navigateToUrl(page, url);
    }));
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

export function mapMigrosArticleToProduct(article: MigrosArticle): Product {
    return {
        externalId: article.id,
        name: article.name,
        retailer: RETAILER.MIGROS,
        prices: [{
            date: new Date(),
            price: extractPrice(article),
            original_price: extractOriginalPrice(article),
            quantity: withoutHTMLTags(article.price_info?.quantity || article.product_tile_infos?.price_sub_text)
        }],
    }
}

async function getMaxPages(url: string, selector: string) {
    const page = await openNewPage();
    await navigateToUrl(page, url);
    await autoScroll(page);
    const maxPages = await page.$eval(selector, (el: HTMLButtonElement) => el.innerText);
    closePage(page);
    return maxPages;
}

export class Migroscrawler implements Crawler {
    constructor(private type: CRAWLERTYPE, private baseUrl: string, private pageUrl: string) {}

    async crawl(amountOfPages: number): Promise<void> {
        console.log('starting crawler: ', this.type)
        const stopwatch = new Stopwatch();
        initializeBrowser();

        const maxPages = parseInt(await getMaxPages(this.baseUrl, migrosLastButtonSelector));

        for (let i = 1; i <= maxPages && i <= amountOfPages; i++) {
            // Fills up combinedMigrosData array
            const migrosArticles = await loadDataFromNetwork(`${this.baseUrl}${this.pageUrl}${i}`);
            Promise.all(migrosArticles.map(mapMigrosArticleToProduct).map(createOrUpdateProduct));
        }
        closeBrowser();
        console.log(`${this.type} done in ${stopwatch.stopTimer(STOPWATCH_FORMAT.SECS)} seconds`)
    }
}
