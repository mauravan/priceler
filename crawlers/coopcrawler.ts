import {Crawler, CRAWLERTYPE} from "./crawler";
import {
    onlyNumbersParsingToInt,
    Stopwatch,
    STOPWATCH_FORMAT,
    withoutLeadngAndTrailingWhitespace,
} from "../config/helpers";
import {goToPageReturningDom} from "../jsdom/jsdomHelper";
import {Product, RETAILER} from "../config/types";
import {autoScroll, initializeBrowser, navigateToUrl, openNewPage} from "../puppeteer/priclerPuppeteer";
import {Page} from "puppeteer";
import {createOrUpdateProduct} from "../db/database";


const clickSeeAllButtonFromDom = (dom: Document): void => (dom.querySelector('a.cmsTeaserRow-controls__see-all') as HTMLAnchorElement).click();
const getCoopCarouselContainigLinks = (dom: Document): NodeListOf<HTMLLIElement> => dom.querySelectorAll('div.cmsList.cmsList--link>ul.cmsList__list');
const getCoopLinksFromContainer = (el: Element) => el.querySelectorAll('a.cmsList__itemLink');


export class Coopcrawler implements Crawler {
    constructor(private type: CRAWLERTYPE, private baseUrl: string, private pageUrl: string) {
    }

    async getCategoryUrls(): Promise<Set<string>> {
        const dom = await goToPageReturningDom(this.baseUrl);
        clickSeeAllButtonFromDom(dom)
        return new Set(Array.from(getCoopCarouselContainigLinks(dom))
            .reduce((acc, curr) => [...acc, ...Array.from(getCoopLinksFromContainer(curr))], [])
            .map(el => el.href))
    }

    async loadAllProductsToDom(page: Page) {
        try {
            await autoScroll(page)
            while (await page.evaluate(() =>  document.querySelector('a.list-page__trigger') != null && document.querySelector('a.list-page__trigger').style.display !== 'none')) {
                await page.evaluate(() => document.querySelector('.list-page__trigger').click())
                await autoScroll(page)
            }
        } catch (e) {
            console.log('error trying to autoscroll - continuing')
        }
    }

    mapCoopDivResultToProduct(divs: Array<HTMLDivElement>) {
        return divs.map(div => {
            const isPromoted = div.querySelector('dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save') != null && div.querySelector('dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save').style.display !== 'none';
            let price;
            let original_price = '';
            if (isPromoted) {
                price = div.querySelector('dd.productTile__price-value.productTile__price-value-lead.productTile__price-value-lead--marked').innerHTML;
                original_price = div.querySelector('dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save').innerHTML;
            } else {
                price = div.querySelector('dd.productTile__price-value.productTile__price-value-lead').innerHTML;
            }

            return {
                externalId: parseInt(div.querySelector('a.productTile ').id),
                name: div.querySelector('p.productTile-details__name-value').innerHTML,
                prices: [{
                    price,
                    original_price,
                    quantity: div.querySelector('span.productTile__quantity-text').innerHTML
                }]
            }
        })
    }

    async loadProductsPerCategory(url: string): Promise<Array<Product>> {
        const page = await openNewPage();
        await navigateToUrl(page, url);
        await this.loadAllProductsToDom(page);
        const productsAsHTML = await page.$$eval('div.productTile__wrapper', this.mapCoopDivResultToProduct);

        await page.close();

        return productsAsHTML.map(productAsHTML => {
            const price = productAsHTML.prices[0];
            return {
                name: productAsHTML.name,
                externalId: productAsHTML.externalId,
                retailer: RETAILER.COOP,
                prices: [{
                    date: new Date(),
                    quantity: withoutLeadngAndTrailingWhitespace(price.quantity),
                    price: onlyNumbersParsingToInt(price.price),
                    original_price: onlyNumbersParsingToInt(price.original_price)
                }]
            }
        })
    }

    async crawl(amountOfPages: number): Promise<void> {
        console.log('starting crawler: ', this.type)
        const stopwatch = new Stopwatch();

        const coopCategoryUrls = await this.getCategoryUrls();
        initializeBrowser();

        const coopCategoryUrlsAsArray = Array.from(coopCategoryUrls);
        const maxPages = coopCategoryUrlsAsArray.length;

        for (let i = 0; i < maxPages && i < amountOfPages; i++) {
            const productsByCategory = await this.loadProductsPerCategory(coopCategoryUrlsAsArray[i]);
            productsByCategory.forEach(createOrUpdateProduct);
        }

        console.log(`${this.type} done in ${stopwatch.stopTimer(STOPWATCH_FORMAT.SECS)} seconds`)
    }
}