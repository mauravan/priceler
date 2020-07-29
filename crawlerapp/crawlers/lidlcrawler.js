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
exports.__esModule = true;
exports.Lidlcrawler = void 0;
var helpers_1 = require("../../config/helpers");
var jsdomHelper_1 = require("../jsdom/jsdomHelper");
var types_1 = require("../../types/types");
var products_database_1 = require("../db/products.database");
var env_1 = require("../../config/env");
var getExternalIdFromDetailHTML = function (details) {
    return parseInt(details.querySelector("div.price-box.price-final_price")
        .dataset.productId);
};
var getNameFromDetailHTML = function (details) {
    return details.querySelector("strong.product.name.product-item-name").innerHTML + " " + details.querySelector("div.product.description.product-item-description")
        .innerHTML;
};
var getPriceFromDetailHTML = function (details) {
    return helpers_1.onlyNumbersParsingToInt(details.querySelector("strong.pricefield__price").getAttribute("content"));
};
var getOriginalPriceFromDetailHTML = function (details) {
    return details.querySelector(".pricefield__old-price") != null
        ? helpers_1.onlyNumbersParsingToInt(details.querySelector(".pricefield__old-price").innerHTML)
        : 0;
};
var getQuantityFromDetailHTML = function (details) {
    return helpers_1.withoutLeadingAndTrailingWhitespace(details.querySelector("span.pricefield__footer").innerHTML);
};
var lidlProductListId = "amasty-shopby-product-list";
var lidlListQuerySelector = "ol.products.list.items.product-items";
var lidlDetailSelector = "div.product.details.product-item-details";
var Lidlcrawler = /** @class */ (function () {
    function Lidlcrawler(type, baseUrl, pageUrl) {
        this.type = type;
        this.baseUrl = baseUrl;
        this.pageUrl = pageUrl;
    }
    Lidlcrawler.prototype.getMaxCount = function (document) {
        return parseInt(document.getElementById("am-page-count").innerHTML);
    };
    // pro 12 Stück
    // pro 1kg
    // ca. 180-220g
    // ca. 255g
    // pro 0,75l | 1l = 6.66 CHF
    // pro 190g/200g | 100g = 2.63,2.50 CHF
    // pro 26,30,36 Stk. | 1 Stk = 0.20, 0.17, 0.14 CHF
    // pro 3x90g | 100g = 1.82 CHF
    // ["pro", "3x90g", "|", "100g", "=", "1.82", "CHF"]
    Lidlcrawler.prototype.getQuantityDetailsWithUnit = function (quantity) {
        // &nbsp;
        if (!quantity || quantity === "&nbsp;") {
            return {
                unit: "",
                quantity: 1
            };
        }
        var splitByPipe = quantity.split("|");
        var withoutPro = helpers_1.withoutLeadingAndTrailingWhitespace(splitByPipe[0]).substr(3);
        var splitNumberAndUnit = /[a-z|ü|;]+|[^a-z|;|\s]+/gi; //
        var matchNumberAndUnit = /\d+,?\d? ?[a-z|ü]+/gi; // number and unit
        try {
            // ["Stück"]
            if (!helpers_1.containsNumber(withoutPro)) {
                return {
                    unit: withoutPro,
                    quantity: 1
                };
            }
            var valueOrUnit = withoutPro.match(matchNumberAndUnit);
            var value = valueOrUnit[valueOrUnit.length - 1];
            // ["3x90g"]
            if (value.includes("x")) {
                var multiplier = parseInt(value.split("x")[0]);
                var _a = value.match(splitNumberAndUnit), quant_1 = _a[0], unit_1 = _a[1];
                return {
                    quantity: multiplier * parseFloat(quant_1),
                    unit: unit_1
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
            var _b = value.match(splitNumberAndUnit), quant = _b[0], unit = _b[1];
            return {
                quantity: parseFloat(quant),
                unit: unit
            };
        }
        catch (e) {
            console.log(quantity, withoutPro, e);
        }
    };
    Lidlcrawler.prototype.mapLidlHTMLToPrduct = function (lidlProductAsHTML) {
        var lidlDetails = lidlProductAsHTML.querySelector(lidlDetailSelector);
        var quantityFromDetailHTML = getQuantityFromDetailHTML(lidlDetails);
        var _a = this.getQuantityDetailsWithUnit(quantityFromDetailHTML), quantity = _a.quantity, unit = _a.unit;
        var priceFromDetailHTML = getPriceFromDetailHTML(lidlDetails);
        return {
            externalId: getExternalIdFromDetailHTML(lidlDetails),
            name: getNameFromDetailHTML(lidlDetails),
            retailer: types_1.RETAILER.LIDL,
            category: "",
            prices: [
                {
                    price: priceFromDetailHTML,
                    quantity: quantity,
                    original_price: getOriginalPriceFromDetailHTML(lidlDetails),
                    date: new Date(),
                    unit: unit,
                    normalized_price: helpers_1.normalizedPrice(priceFromDetailHTML, quantity)
                },
            ]
        };
    };
    Lidlcrawler.prototype.getDataFromDocument = function (document) {
        var listElements = document
            .getElementById(lidlProductListId)
            .querySelector(lidlListQuerySelector).children;
        return Array.from(listElements).map(this.mapLidlHTMLToPrduct.bind(this));
    };
    Lidlcrawler.prototype.crawl = function (amountOfPages) {
        return __awaiter(this, void 0, void 0, function () {
            var stopwatch, loadedDom, maxPages, i, loadedJsDom, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("starting crawler: ", this.type);
                        stopwatch = new helpers_1.Stopwatch();
                        return [4 /*yield*/, jsdomHelper_1.goToPageReturningDom(this.baseUrl + this.pageUrl + "1")];
                    case 1:
                        loadedDom = _a.sent();
                        maxPages = this.getMaxCount(loadedDom);
                        console.log("Found pages: ", maxPages);
                        i = 1;
                        _a.label = 2;
                    case 2:
                        if (!(i <= maxPages && i <= amountOfPages)) return [3 /*break*/, 7];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, jsdomHelper_1.goToPageReturningDom("" + (this.baseUrl + this.pageUrl) + i)];
                    case 4:
                        loadedJsDom = _a.sent();
                        try {
                            this.getDataFromDocument(loadedJsDom).map(products_database_1.createOrUpdateProduct);
                        }
                        catch (e) {
                            console.log("Error in mapping data in crawler: ", this.type, " | ", e);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        if (env_1.debugMode()) {
                            console.log("Error in loading dom in crawler: ", this.type, ", ", e_1);
                        }
                        console.log("retry: ", i--);
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 2];
                    case 7:
                        console.log(this.type + " done in " + stopwatch.stopTimer(helpers_1.STOPWATCH_FORMAT.SECS) + " seconds");
                        return [2 /*return*/];
                }
            });
        });
    };
    return Lidlcrawler;
}());
exports.Lidlcrawler = Lidlcrawler;
