import {MigrosArticle, Product, RETAILER} from "./types";
import {Browser, Page} from "puppeteer";

export const migrosLastButtonSelector = 'button[data-testid="msrc-articles--pagination-link-last-page"]';

function extractPrice(product: MigrosArticle): number {
    const metaPrice = product.meta?.price;
    const priceInfoPrice = product.price_info?.price;
    if (metaPrice) {
        return metaPrice;
    }
    if (priceInfoPrice) {
        return parseInt(priceInfoPrice.replace(/\D/g, ''));
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
        return parseInt(priceInfoPrice.replace(/\D/g, ''));
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
            quantity: article.price_info?.quantity || article.product_tile_infos?.price_sub_text
        }],
    }
}

function autoScroll(page: Page) {
    return page.evaluate(() => {
        return new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

export async function getMaxPages(browser: Browser, url: string, selector: string) {
    const page = await browser.newPage();
    await page.goto(url);
    await autoScroll(page);
    const maxPages = await page.$eval(selector, (el: HTMLButtonElement) => el.innerText);
    await page.close()
    return maxPages;
}
