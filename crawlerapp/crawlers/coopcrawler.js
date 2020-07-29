"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Coopcrawler = void 0;
var helpers_1 = require("../../config/helpers");
var jsdomHelper_1 = require("../jsdom/jsdomHelper");
var priclerPuppeteer_1 = require("../puppeteer/priclerPuppeteer");
var types_1 = require("../../types/types");
var products_database_1 = require("../db/products.database");
var clickSeeAllButtonFromDom = function (dom) {
    return dom.querySelector("a.cmsTeaserRow-controls__see-all").click();
};
var getCoopCarouselContainigLinks = function (dom) {
    return dom.querySelectorAll("div.cmsList.cmsList--link>ul.cmsList__list");
};
var getCoopLinksFromContainer = function (el) {
    return el.querySelectorAll("a.cmsList__itemLink");
};
var listPageTriggerPresent = function () {
    return document.querySelector("a.list-page__trigger") != null &&
        // @ts-ignore
        document.querySelector("a.list-page__trigger").style.display !== "none";
};
var clickListPageTrigger = function () {
    // @ts-ignore
    return document.querySelector(".list-page__trigger").click();
};
var Coopcrawler = /** @class */ (function () {
    function Coopcrawler(type, baseUrl, pageUrl) {
        this.type = type;
        this.baseUrl = baseUrl;
        this.pageUrl = pageUrl;
    }
    Coopcrawler.prototype.getCategoryUrls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dom;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, jsdomHelper_1.goToPageReturningDom(this.baseUrl)];
                    case 1:
                        dom = _a.sent();
                        clickSeeAllButtonFromDom(dom);
                        return [2 /*return*/, Array.from(getCoopCarouselContainigLinks(dom))
                                .reduce(function (acc, curr) { return __spreadArrays(acc, Array.from(getCoopLinksFromContainer(curr))); }, [])
                                .map(function (el) { return ({ url: el.href, cat: el.text }); })];
                }
            });
        });
    };
    Coopcrawler.prototype.loadAllProductsToDom = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, priclerPuppeteer_1.autoScroll(page)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, page.evaluate(listPageTriggerPresent)];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 6];
                        return [4 /*yield*/, page.evaluate(clickListPageTrigger)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, priclerPuppeteer_1.autoScroll(page)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        console.log("error trying to autoscroll - continuing", e_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Run in Browser context
    Coopcrawler.prototype.mapCoopDivResultToProduct = function (divs) {
        var safeQueryInnerHtml = function (element, query) {
            var maybeElement = element.querySelector(query);
            if (maybeElement) {
                return maybeElement.innerHTML;
            }
            return "";
        };
        return divs.map(function (div) {
            // @ts-ignore
            var isPromoted = div.querySelector("dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save") != null &&
                div.querySelector("dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save"
                // @ts-ignore
                ).style.display !== "none";
            var price;
            var original_price = "";
            if (isPromoted) {
                price = safeQueryInnerHtml(div, "dd.productTile__price-value.productTile__price-value-lead.productTile__price-value-lead--marked");
                original_price = safeQueryInnerHtml(div, "dd.productTile__price-value.productTile__price-value--red.productTile__price-value-save");
            }
            else {
                price = safeQueryInnerHtml(div, "dd.productTile__price-value.productTile__price-value-lead");
            }
            return {
                externalId: parseInt(div.querySelector("a.productTile ").id),
                name: safeQueryInnerHtml(div, "p.productTile-details__name-value"),
                prices: [
                    {
                        price: price,
                        original_price: original_price,
                        quantity: safeQueryInnerHtml(div, "span.productTile__quantity-text"),
                    },
                ],
            };
        });
    };
    // Quantity: 190g, 2x&nbsp;125g, 1.1kg, 500ml, 6ST, 2x 150g
    Coopcrawler.prototype.parseQuantityAndUnit = function (quantity) {
        if (!quantity) {
            return {
                quantity: 0,
                unit: "",
            };
        }
        // ["190", "g"], ["2", "x", "&", "nbsp;", "125", "g"], ["1.1", "kg"], ["6", "ST"], ["2", "x ", "150", "g"]
        var splitValues = quantity.match(/[a-z|;|\s]+|[^a-z|;|\s]+/gi);
        var unit = splitValues[splitValues.length - 1];
        if (splitValues.length > 2) {
            var multiplier = parseInt(splitValues[0]);
            var quantityAsString_1 = splitValues[splitValues.length - 2];
            if (quantityAsString_1.includes(".")) {
                var parsedQuantityFloat = parseFloat(quantityAsString_1);
                return {
                    quantity: multiplier * parsedQuantityFloat,
                    unit: unit,
                };
            }
            var parsedQuantityInt = parseInt(quantityAsString_1);
            return {
                quantity: multiplier * parsedQuantityInt,
                unit: unit,
            };
        }
        var quantityAsString = splitValues[0];
        if (quantityAsString.includes(".")) {
            var quantityAsFloat = parseFloat(quantityAsString);
            return {
                quantity: quantityAsFloat,
                unit: unit,
            };
        }
        var quantitAsInt = parseInt(quantityAsString);
        return {
            quantity: quantitAsInt,
            unit: unit,
        };
    };
    Coopcrawler.prototype.loadProductsPerCategory = function (_a, browser) {
        var url = _a.url, cat = _a.cat;
        return __awaiter(this, void 0, void 0, function () {
            var productsAsHTML;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.readProductsFromDom(browser, url)];
                    case 1:
                        productsAsHTML = _b.sent();
                        return [2 /*return*/, productsAsHTML.map(this.mapHTMLProductToProduct(cat))];
                }
            });
        });
    };
    Coopcrawler.prototype.mapHTMLProductToProduct = function (cat) {
        var _this = this;
        return function (productAsHTML) {
            var price = productAsHTML.prices[0];
            var _a = _this.parseQuantityAndUnit(helpers_1.withoutLeadingAndTrailingWhitespace(price.quantity)), quantity = _a.quantity, unit = _a.unit;
            var priceAsInt = helpers_1.onlyNumbersParsingToInt(price.price);
            return {
                name: productAsHTML.name,
                externalId: productAsHTML.externalId,
                retailer: types_1.RETAILER.COOP,
                category: cat,
                prices: [
                    {
                        date: new Date(),
                        quantity: quantity,
                        price: priceAsInt,
                        original_price: helpers_1.onlyNumbersParsingToInt(price.original_price),
                        unit: unit,
                        normalized_price: helpers_1.normalizedPrice(priceAsInt, quantity),
                    },
                ],
            };
        };
    };
    Coopcrawler.prototype.readProductsFromDom = function (browser, url) {
        return __awaiter(this, void 0, void 0, function () {
            var page, productsAsHTML;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, priclerPuppeteer_1.openNewPage(browser)];
                    case 1:
                        page = _a.sent();
                        return [4 /*yield*/, priclerPuppeteer_1.navigateToUrl(page, url, browser)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.loadAllProductsToDom(page)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.$$eval("div.productTile__wrapper", this.mapCoopDivResultToProduct)];
                    case 4:
                        productsAsHTML = _a.sent();
                        return [4 /*yield*/, page.close()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, productsAsHTML];
                }
            });
        });
    };
    // JSDOM
    Coopcrawler.prototype.readCategoriesFromUrlWithoutDuplicates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var coopCategoryUrls, alreadyContainedCategory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCategoryUrls()];
                    case 1:
                        coopCategoryUrls = _a.sent();
                        alreadyContainedCategory = [];
                        return [2 /*return*/, coopCategoryUrls.filter(function (_a) {
                                var url = _a.url;
                                if (alreadyContainedCategory.includes(url)) {
                                    return false;
                                }
                                alreadyContainedCategory.push(url);
                                return true;
                            })];
                }
            });
        });
    };
    Coopcrawler.prototype.crawl = function (amountOfPages) {
        return __awaiter(this, void 0, void 0, function () {
            var stopwatch, browser, categoriesWithoutDuplicates, maxPages, i, productsByCategory, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("starting crawler: ", this.type);
                        stopwatch = new helpers_1.Stopwatch();
                        return [4 /*yield*/, priclerPuppeteer_1.initializeBrowser()];
                    case 1:
                        browser = _a.sent();
                        return [4 /*yield*/, this.readCategoriesFromUrlWithoutDuplicates()];
                    case 2:
                        categoriesWithoutDuplicates = _a.sent();
                        maxPages = categoriesWithoutDuplicates.length;
                        console.log("Found categories: ", categoriesWithoutDuplicates);
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < maxPages && i < amountOfPages)) return [3 /*break*/, 8];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.loadProductsPerCategory(categoriesWithoutDuplicates[i], browser)];
                    case 5:
                        productsByCategory = _a.sent();
                        productsByCategory.forEach(products_database_1.createOrUpdateProduct);
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        console.log("error in loading products to dom, ", e_2);
                        console.log("retrying:", i--);
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 3];
                    case 8: return [4 /*yield*/, priclerPuppeteer_1.closeBrowser(browser)];
                    case 9:
                        _a.sent();
                        console.log(this.type + " done in " + stopwatch.stopTimer(helpers_1.STOPWATCH_FORMAT.SECS) + " seconds");
                        return [2 /*return*/];
                }
            });
        });
    };
    return Coopcrawler;
}());
exports.Coopcrawler = Coopcrawler;
//# sourceMappingURL=coopcrawler.js.map