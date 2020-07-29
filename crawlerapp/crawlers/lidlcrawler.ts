import { Crawler, CRAWLERTYPE } from "./crawler";
import {
  containsNumber,
  normalizedPrice,
  onlyNumbersParsingToInt,
  retryAble,
  Stopwatch,
  STOPWATCH_FORMAT,
  withoutLeadingAndTrailingWhitespace,
} from "../../config/helpers";
import { goToPageReturningDom } from "../jsdom/jsdomHelper";
import { Price, Product, RETAILER } from "../../types/types";
import { createOrUpdateProduct } from "../db/products.database";
import { debugMode } from "../../config/env";

const getExternalIdFromDetailHTML = (details: Element) =>
  parseInt(
    (details.querySelector("div.price-box.price-final_price") as HTMLElement)
      .dataset.productId
  );
const getNameFromDetailHTML = (details: Element) =>
  `${
    details.querySelector("strong.product.name.product-item-name").innerHTML
  } ${
    details.querySelector("div.product.description.product-item-description")
      .innerHTML
  }`;
const getPriceFromDetailHTML = (details: Element) =>
  onlyNumbersParsingToInt(
    details.querySelector("strong.pricefield__price").getAttribute("content")
  );
const getOriginalPriceFromDetailHTML = (details: Element) =>
  details.querySelector(".pricefield__old-price") != null
    ? onlyNumbersParsingToInt(
        details.querySelector(".pricefield__old-price").innerHTML
      )
    : 0;
const getQuantityFromDetailHTML = (details: Element) =>
  withoutLeadingAndTrailingWhitespace(
    details.querySelector("span.pricefield__footer").innerHTML
  );

const lidlProductListId = "amasty-shopby-product-list";
const lidlListQuerySelector = "ol.products.list.items.product-items";
const lidlDetailSelector = "div.product.details.product-item-details";

export class Lidlcrawler implements Crawler {
  constructor(
    private type: CRAWLERTYPE,
    private baseUrl: string,
    private pageUrl: string
  ) {}

  getMaxCount(document: Document) {
    return parseInt(document.getElementById("am-page-count").innerHTML);
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
    if (!quantity || quantity === "&nbsp;") {
      return {
        unit: "",
        quantity: 1,
      };
    }
    const splitByPipe = quantity.split("|");
    const withoutPro = withoutLeadingAndTrailingWhitespace(
      splitByPipe[0]
    ).substr(3);

    const splitNumberAndUnit = /[a-z|ü|;]+|[^a-z|;|\s]+/gi; //
    const matchNumberAndUnit = /\d+,?\d? ?[a-z|ü]+/gi; // number and unit

    try {
      // ["Stück"]
      if (!containsNumber(withoutPro)) {
        return {
          unit: withoutPro,
          quantity: 1,
        };
      }

      const valueOrUnit = withoutPro.match(matchNumberAndUnit);
      const value = valueOrUnit[valueOrUnit.length - 1];

      // ["3x90g"]
      if (value.includes("x")) {
        const multiplier = parseInt(value.split("x")[0]);
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

  mapLidlHTMLToPrduct(lidlProductAsHTML: HTMLElement): Product {
    const lidlDetails = lidlProductAsHTML.querySelector(lidlDetailSelector);
    const quantityFromDetailHTML = getQuantityFromDetailHTML(lidlDetails);
    const { quantity, unit } = this.getQuantityDetailsWithUnit(
      quantityFromDetailHTML
    );
    const priceFromDetailHTML = getPriceFromDetailHTML(lidlDetails);
    return {
      externalId: getExternalIdFromDetailHTML(lidlDetails),
      name: getNameFromDetailHTML(lidlDetails),
      retailer: RETAILER.LIDL,
      category: "",
      prices: [
        {
          price: priceFromDetailHTML,
          quantity: quantity,
          original_price: getOriginalPriceFromDetailHTML(lidlDetails),
          date: new Date(),
          unit: unit,
          normalized_price: normalizedPrice(priceFromDetailHTML, quantity),
        } as Price,
      ],
    };
  }

  getDataFromDocument(document: Document): Array<Product> {
    const listElements = document
      .getElementById(lidlProductListId)
      .querySelector(lidlListQuerySelector).children;
    return Array.from(listElements).map(this.mapLidlHTMLToPrduct.bind(this));
  }

  async crawl(amountOfPages: number): Promise<void> {
    console.log("starting crawler: ", this.type);
    const stopwatch = new Stopwatch();

    const loadedDom = await goToPageReturningDom(
      `${this.baseUrl + this.pageUrl}1`
    );
    const maxPages = this.getMaxCount(loadedDom);

    console.log("Found pages: ", maxPages);

    for (let i = 1; i <= maxPages && i <= amountOfPages; i++) {
      try {
        const loadedJsDom = await goToPageReturningDom(
          `${this.baseUrl + this.pageUrl}${i}`
        );
        try {
          this.getDataFromDocument(loadedJsDom).map(createOrUpdateProduct);
        } catch (e) {
          console.log(
            "Error in mapping data in crawler: ",
            this.type,
            " | ",
            e
          );
        }
      } catch (e) {
        if (debugMode()) {
          console.log("Error in loading dom in crawler: ", this.type, ", ", e);
        }
        console.log("retry: ", i--);
      }
    }

    console.log(
      `${this.type} done in ${stopwatch.stopTimer(
        STOPWATCH_FORMAT.SECS
      )} seconds`
    );
  }
}
