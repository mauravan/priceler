import { Crawler } from './crawler';
import { goToPageReturningDom } from '../jsdom/jsdomHelper';
import { types, env, helpers } from 'pricler-types';

const getExternalIdFromDetailHTML = (details: Element) =>
    parseInt((details.querySelector('div.price-box.price-final_price') as HTMLElement).dataset.productId);
const getNameFromDetailHTML = (details: Element) =>
    `${details.querySelector('strong.product.name.product-item-name').innerHTML} ${
        details.querySelector('div.product.description.product-item-description').innerHTML
    }`;
const getPriceFromDetailHTML = (details: Element) =>
    helpers.onlyNumbersParsingToInt(details.querySelector('strong.pricefield__price').getAttribute('content'));
const getOriginalPriceFromDetailHTML = (details: Element) =>
    details.querySelector('.pricefield__old-price') != null
        ? helpers.onlyNumbersParsingToInt(details.querySelector('.pricefield__old-price').innerHTML)
        : 0;
const getQuantityFromDetailHTML = (details: Element) =>
    helpers.withoutLeadingAndTrailingWhitespace(details.querySelector('span.pricefield__footer').innerHTML);

const lidlProductListId = 'amasty-shopby-product-list';
const lidlListQuerySelector = 'ol.products.list.items.product-items';
const lidlDetailSelector = 'div.product.details.product-item-details';

export class Lidlcrawler implements Crawler {
    constructor(
        private database: types.IDatabase,
        private type: types.CRAWLERTYPE,
        private baseUrl: string,
        private pageUrl: string
    ) {}

    getMaxCount(document: Document) {
        return parseInt(document.getElementById('am-page-count').innerHTML);
    }

    // pro 12 Stück
    // pro 1kg
    // ca. 180-220g
    // ca. 255g
    // pro 0,75l | 1l = 6.66 CHF
    // pro 190g/200g | 100g = 2.63,2.50 CHF
    // pro 26,30,36 Stk. | 1 Stk = 0.20, 0.17, 0.14 CHF
    // pro 3x90g | 100g = 1.82 CHF
    // ["pro", "3x90g", "|", "100g", "=", "1.82", "CHF"]
    getQuantityDetailsWithUnit(quantity: string) {
        // &nbsp;
        if (!quantity || quantity === '&nbsp;') {
            return {
                unit: '',
                quantity: 1,
            };
        }
        const splitByPipe = quantity.split('|');
        const withoutPro = helpers.withoutLeadingAndTrailingWhitespace(splitByPipe[0]).substr(3);

        const splitNumberAndUnit = /[a-z|ü|;]+|[^a-z|;|\s]+/gi; //
        const matchNumberAndUnit = /\d+,?\d? ?[a-z|ü]+/gi; // number and unit

        try {
            // ["Stück"]
            if (!helpers.containsNumber(withoutPro)) {
                return {
                    unit: withoutPro,
                    quantity: 1,
                };
            }

            const valueOrUnit = withoutPro.match(matchNumberAndUnit);
            const value = valueOrUnit[valueOrUnit.length - 1];

            // ["3x90g"]
            if (value.includes('x')) {
                const multiplier = parseInt(value.split('x')[0]);
                const [quant, unit] = value.match(splitNumberAndUnit);
                return {
                    quantity: multiplier * parseFloat(quant),
                    unit: unit,
                };
            }

            // ["275g,400g"]
            // ["47g/60Stk"]
            // ["190g/200g"]
            // ["12,5g,15g,25g"]
            // ["12 Stück"]
            // ["14 Stück,20 Stück"]
            // ["14 Stück,20 Stück"]
            // ["1kg"]
            // ["180-220g"]
            // ["26,30,36 Stk."]
            // ["12 Stück"]
            const [quant, unit] = value.match(splitNumberAndUnit);
            return {
                quantity: parseFloat(quant),
                unit: unit,
            };
        } catch (e) {
            console.log(quantity, withoutPro, e);
        }
    }

    mapLidlHTMLToPrduct(lidlProductAsHTML: HTMLElement): types.Product {
        const lidlDetails = lidlProductAsHTML.querySelector(lidlDetailSelector);
        const quantityFromDetailHTML = getQuantityFromDetailHTML(lidlDetails);
        const { quantity, unit } = this.getQuantityDetailsWithUnit(quantityFromDetailHTML);
        const priceFromDetailHTML = getPriceFromDetailHTML(lidlDetails);
        return {
            externalId: getExternalIdFromDetailHTML(lidlDetails),
            name: getNameFromDetailHTML(lidlDetails),
            retailer: types.RETAILER.LIDL,
            category: '',
            prices: [
                {
                    price: priceFromDetailHTML,
                    quantity: quantity,
                    original_price: getOriginalPriceFromDetailHTML(lidlDetails),
                    date: new Date(),
                    unit: unit,
                    normalized_price: helpers.normalizedPrice(priceFromDetailHTML, quantity),
                } as types.Price,
            ],
        };
    }

    getDataFromDocument(document: Document): Array<types.Product> {
        const listElements = document.getElementById(lidlProductListId).querySelector(lidlListQuerySelector).children;
        return Array.from(listElements).map(this.mapLidlHTMLToPrduct.bind(this));
    }

    async crawl(amountOfPages: number): Promise<void> {
        console.log('starting crawler: ', this.type);
        const stopwatch = new helpers.Stopwatch();

        const loadedDom = await goToPageReturningDom(`${this.baseUrl + this.pageUrl}1`);
        const maxPages = this.getMaxCount(loadedDom);

        console.log('Found pages: ', maxPages);

        let retry = 5;
        for (let i = env.startingPageLidl(); i <= maxPages && i <= amountOfPages; i++) {
            try {
                const loadedJsDom = await goToPageReturningDom(`${this.baseUrl + this.pageUrl}${i}`);
                try {
                    this.getDataFromDocument(loadedJsDom).map(this.database.createOrUpdateProduct);
                } catch (e) {
                    console.log('Error in mapping data in crawler: ', this.type, ' | ', e);
                }
                retry = 5;
            } catch (e) {
                if (env.debugMode()) {
                    console.log('Error in loading dom in crawler: ', this.type, ', ', e);
                }
                if (retry > 0) {
                    console.log(this.type, ' | retry: ', i--, ' for: ', retry--, ' times');
                } else {
                    console.log(this.type, ' | giving up, going to next page');
                }
            }
        }

        console.log(`${this.type} done in ${stopwatch.stopTimer(helpers.STOPWATCH_FORMAT.SECS)} seconds`);
    }
}
