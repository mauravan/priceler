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
var types_1 = require("../../config/types");
var database_1 = require("../../db/database");
var helpers_1 = require("../../config/helpers");
var jsdomHelper_1 = require("../jsdom/jsdomHelper");
var getExternalIdFromDetailHTML = function (details) { return parseInt(details.querySelector('div.price-box.price-final_price').dataset.productId); };
var getNameFromDetailHTML = function (details) { return details.querySelector('strong.product.name.product-item-name').innerHTML + " " + details.querySelector('div.product.description.product-item-description').innerHTML; };
var getPriceFromDetailHTML = function (details) { return helpers_1.onlyNumbersParsingToInt(details.querySelector('strong.pricefield__price').getAttribute('content')); };
var getOriginalPriceFromDetailHTML = function (details) { return details.querySelector('.pricefield__old-price') != null ? helpers_1.onlyNumbersParsingToInt(details.querySelector('.pricefield__old-price').innerHTML) : 0; };
var getQuantityFromDetailHTML = function (details) { return helpers_1.withoutLeadngAndTrailingWhitespace(details.querySelector('span.pricefield__footer').innerHTML); };
var lidlProductListId = 'amasty-shopby-product-list';
var lidlListQuerySelector = 'ol.products.list.items.product-items';
var lidlDetailSelector = 'div.product.details.product-item-details';
var Lidlcrawler = /** @class */ (function () {
    function Lidlcrawler(type, baseUrl, pageUrl) {
        this.type = type;
        this.baseUrl = baseUrl;
        this.pageUrl = pageUrl;
    }
    Lidlcrawler.prototype.getMaxCount = function (document) {
        return parseInt(document.getElementById('am-page-count').innerHTML);
    };
    Lidlcrawler.prototype.mapLidlHTMLToPrduct = function (lidlProductAsHTML) {
        var lidlDetails = lidlProductAsHTML.querySelector(lidlDetailSelector);
        return {
            externalId: getExternalIdFromDetailHTML(lidlDetails),
            name: getNameFromDetailHTML(lidlDetails),
            retailer: types_1.RETAILER.LIDL,
            prices: [{
                    price: getPriceFromDetailHTML(lidlDetails),
                    quantity: getQuantityFromDetailHTML(lidlDetails),
                    original_price: getOriginalPriceFromDetailHTML(lidlDetails),
                    date: new Date(),
                }]
        };
    };
    Lidlcrawler.prototype.getDataFromDocument = function (document) {
        var listElements = document.getElementById(lidlProductListId).querySelector(lidlListQuerySelector).children;
        return Array.from(listElements).map(this.mapLidlHTMLToPrduct);
    };
    Lidlcrawler.prototype.crawl = function (amountOfPages) {
        return __awaiter(this, void 0, void 0, function () {
            var stopwatch, loadedDom, maxPages, _loop_1, this_1, out_i_1, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('starting crawler: ', this.type);
                        stopwatch = new helpers_1.Stopwatch();
                        return [4 /*yield*/, jsdomHelper_1.goToPageReturningDom(this.baseUrl + this.pageUrl + "1")];
                    case 1:
                        loadedDom = _a.sent();
                        maxPages = this.getMaxCount(loadedDom);
                        _loop_1 = function (i) {
                            var loadedJsDom, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, helpers_1.retryAble(function () { return jsdomHelper_1.goToPageReturningDom("" + (_this.baseUrl + _this.pageUrl) + i); })];
                                    case 1:
                                        loadedJsDom = _a.sent();
                                        try {
                                            this_1.getDataFromDocument(loadedJsDom).map(database_1.createOrUpdateProduct);
                                        }
                                        catch (e) {
                                            console.log('Error in mapping data in crawler: ', this_1.type);
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_1 = _a.sent();
                                        console.log('Error in loading dom in crawler: ', this_1.type, ', ', e_1);
                                        console.log('retry: ', i--);
                                        return [3 /*break*/, 3];
                                    case 3:
                                        out_i_1 = i;
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 1;
                        _a.label = 2;
                    case 2:
                        if (!(i <= maxPages && i <= amountOfPages)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(i)];
                    case 3:
                        _a.sent();
                        i = out_i_1;
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        console.log(this.type + " done in " + stopwatch.stopTimer(helpers_1.STOPWATCH_FORMAT.SECS) + " seconds");
                        return [2 /*return*/];
                }
            });
        });
    };
    return Lidlcrawler;
}());
exports.Lidlcrawler = Lidlcrawler;
//# sourceMappingURL=lidlcrawler.js.map