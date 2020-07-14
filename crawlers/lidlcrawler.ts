import {Crawler, CRAWLERTYPE} from "./crawler";
import {Price, Product, RETAILER} from "../config/types";
import {createOrUpdateProduct} from "../db/database";
import {
    onlyNumbersParsingToInt,
    Stopwatch,
    STOPWATCH_FORMAT,
    withoutLeadngAndTrailingWhitespace
} from "../config/helpers";
import {goToPageReturningDom} from "../jsdom/jsdomHelper";

const getExternalIdFromDetailHTML = (details: Element) => parseInt((details.querySelector('div.price-box.price-final_price') as HTMLElement).dataset.productId);
const getNameFromDetailHTML = (details: Element) => `${details.querySelector('strong.product.name.product-item-name').innerHTML} ${details.querySelector('div.product.description.product-item-description').innerHTML}`;
const getPriceFromDetailHTML = (details: Element) => onlyNumbersParsingToInt(details.querySelector('strong.pricefield__price').getAttribute('content'))
const getOriginalPriceFromDetailHTML = (details: Element) => details.querySelector('.pricefield__old-price') != null ? onlyNumbersParsingToInt(details.querySelector('.pricefield__old-price').innerHTML) : 0
const getQuantityFromDetailHTML = (details: Element) => withoutLeadngAndTrailingWhitespace(details.querySelector('span.pricefield__footer').innerHTML)

const lidlProductListId = 'amasty-shopby-product-list'
const lidlListQuerySelector = 'ol.products.list.items.product-items'
const lidlDetailSelector = 'div.product.details.product-item-details'

export class Lidlcrawler implements Crawler {
    constructor(private type: CRAWLERTYPE, private baseUrl: string, private pageUrl: string) {
    }

    getMaxCount(document: Document) {
        return parseInt(document.getElementById('am-page-count').innerHTML)
    }

    mapLidlHTMLToPrduct(lidlProductAsHTML: HTMLElement): Product {
        const lidlDetails = lidlProductAsHTML.querySelector(lidlDetailSelector);
        return {
            externalId: getExternalIdFromDetailHTML(lidlDetails),
            name: getNameFromDetailHTML(lidlDetails),
            retailer: RETAILER.LIDL,
            prices: [{
                price: getPriceFromDetailHTML(lidlDetails),
                quantity: getQuantityFromDetailHTML(lidlDetails),
                original_price: getOriginalPriceFromDetailHTML(lidlDetails),
                date: new Date(),
            } as Price]
        }
    }

    getDataFromDocument(document: Document): Promise<Array<Product>> {
        const listElements = document.getElementById(lidlProductListId).querySelector(lidlListQuerySelector).children
        const lidlProducts = Array.from(listElements).map(this.mapLidlHTMLToPrduct)
        return Promise.resolve(lidlProducts)
    }

    async crawl(amountOfPages: number): Promise<void> {
        console.log('starting crawler: ', this.type)
        const stopwatch = new Stopwatch();

        const loadedDom = await goToPageReturningDom(`${this.baseUrl + this.pageUrl}1`)
        const maxPages = this.getMaxCount(loadedDom);

        for (let i = 1; i <= maxPages && i <= amountOfPages; i++) {
            const loadedJsDom = await goToPageReturningDom(`${this.baseUrl + this.pageUrl}${i}`)
            const lidlArticles = await this.getDataFromDocument(loadedDom);
            Promise.all(lidlArticles.map(createOrUpdateProduct));
        }

        console.log(`${this.type} done in ${stopwatch.stopTimer(STOPWATCH_FORMAT.SECS)} seconds`)
    }
}
