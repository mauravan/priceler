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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migroscrawler = exports.mapMigrosArticleToProduct = exports.migrosLastButtonSelector = void 0;
var priclerPuppeteer_1 = require("../puppeteer/priclerPuppeteer");
var helpers_1 = require("../../config/helpers");
var types_1 = require("../../types/types");
var database_1 = require("../db/database");
exports.migrosLastButtonSelector = 'button[data-testid="msrc-articles--pagination-link-last-page"]';
function loadDataFromNetwork(url, browser) {
    return __awaiter(this, void 0, void 0, function () {
        var page;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, priclerPuppeteer_1.openNewPage(browser)];
                case 1:
                    page = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        page.on("response", function (response) { return __awaiter(_this, void 0, void 0, function () {
                                            var data;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (response.status() === 500) {
                                                            reject(response);
                                                        }
                                                        if (!response
                                                            .url()
                                                            .includes("web-api.migros.ch/widgets/product_fragments_json")) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, response.json()];
                                                    case 1:
                                                        data = _a.sent();
                                                        resolve(data);
                                                        return [4 /*yield*/, priclerPuppeteer_1.closePage(page)];
                                                    case 2:
                                                        _a.sent();
                                                        _a.label = 3;
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [4 /*yield*/, priclerPuppeteer_1.navigateToUrl(page, url, browser)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
            }
        });
    });
}
function extractPrice(product) {
    var _a, _b;
    var metaPrice = (_a = product.meta) === null || _a === void 0 ? void 0 : _a.price;
    var priceInfoPrice = (_b = product.price_info) === null || _b === void 0 ? void 0 : _b.price;
    if (metaPrice) {
        return metaPrice;
    }
    if (priceInfoPrice) {
        return helpers_1.onlyNumbersParsingToInt(priceInfoPrice);
    }
    return 0;
}
function extractOriginalPrice(product) {
    var _a, _b;
    var metaPrice = (_a = product.meta) === null || _a === void 0 ? void 0 : _a.original_price;
    var priceInfoPrice = (_b = product.price_info) === null || _b === void 0 ? void 0 : _b.original_price;
    if (metaPrice) {
        return metaPrice;
    }
    if (priceInfoPrice) {
        return helpers_1.onlyNumbersParsingToInt(priceInfoPrice);
    }
    return null;
}
function extractQuantityAndUnit(quantityText) {
    var quantityAndUnit = quantityText.replace(".", "").split(",", 1)[0];
    var splitNumberAndUnit = /[a-z|ü]+|[^a-z|\s]+/gi;
    var quantityAndUnitSeperated = quantityAndUnit.match(splitNumberAndUnit);
    // 3 x 38g
    if (quantityAndUnitSeperated.length > 2) {
        var multiplier = parseInt(quantityAndUnitSeperated[0]);
        var unit_1 = quantityAndUnitSeperated[quantityAndUnitSeperated.length - 1];
        var quantity_1 = parseFloat(quantityAndUnitSeperated[quantityAndUnitSeperated.length - 2]);
        return {
            quantity: multiplier * quantity_1,
            unit: unit_1,
        };
    }
    var quantity = parseFloat(quantityAndUnitSeperated[0]);
    var unit = quantityAndUnitSeperated[1];
    return {
        quantity: quantity,
        unit: unit,
    };
}
function mapMigrosArticleToProduct(article) {
    var _a, _b, _c;
    var quantityText = helpers_1.withoutHTMLTags(((_a = article.price_info) === null || _a === void 0 ? void 0 : _a.quantity) || ((_b = article.product_tile_infos) === null || _b === void 0 ? void 0 : _b.price_sub_text));
    var _d = extractQuantityAndUnit(quantityText), quantity = _d.quantity, unit = _d.unit;
    var price = extractPrice(article);
    return {
        externalId: article.id,
        name: article.name,
        retailer: types_1.RETAILER.MIGROS,
        category: (_c = article.categories[1]) === null || _c === void 0 ? void 0 : _c.name,
        prices: [
            {
                date: new Date(),
                price: price,
                original_price: extractOriginalPrice(article),
                quantity: quantity,
                unit: unit,
                normalized_price: helpers_1.normalizedPrice(price, quantity),
            },
        ],
    };
}
exports.mapMigrosArticleToProduct = mapMigrosArticleToProduct;
function getMaxPages(url, selector, browser) {
    return __awaiter(this, void 0, void 0, function () {
        var page, maxPages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, priclerPuppeteer_1.openNewPage(browser)];
                case 1:
                    page = _a.sent();
                    return [4 /*yield*/, priclerPuppeteer_1.navigateToUrl(page, url, browser)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, priclerPuppeteer_1.autoScroll(page)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.$eval(selector, function (el) { return el.innerText; })];
                case 4:
                    maxPages = _a.sent();
                    return [4 /*yield*/, priclerPuppeteer_1.closePage(page)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, maxPages];
            }
        });
    });
}
var Migroscrawler = /** @class */ (function () {
    function Migroscrawler(type, baseUrl, pageUrl) {
        this.type = type;
        this.baseUrl = baseUrl;
        this.pageUrl = pageUrl;
    }
    Migroscrawler.prototype.crawl = function (amountOfPages) {
        return __awaiter(this, void 0, void 0, function () {
            var stopwatch, browser, maxPages, _a, _loop_1, i;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("starting crawler: ", this.type);
                        stopwatch = new helpers_1.Stopwatch();
                        return [4 /*yield*/, priclerPuppeteer_1.initializeBrowser()];
                    case 1:
                        browser = _b.sent();
                        _a = parseInt;
                        return [4 /*yield*/, getMaxPages(this.baseUrl, exports.migrosLastButtonSelector, browser)];
                    case 2:
                        maxPages = _a.apply(void 0, [_b.sent()]);
                        _loop_1 = function (i) {
                            var migrosArticles;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, helpers_1.retryAble(function () {
                                            return loadDataFromNetwork("" + _this.baseUrl + _this.pageUrl + i, browser);
                                        })];
                                    case 1:
                                        migrosArticles = _a.sent();
                                        if (!Array.isArray(migrosArticles)) {
                                            console.log("not an array: ", migrosArticles);
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, Promise.all(migrosArticles.map(mapMigrosArticleToProduct).map(database_1.createOrUpdateProduct))];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 1;
                        _b.label = 3;
                    case 3:
                        if (!(i <= maxPages && i <= amountOfPages)) return [3 /*break*/, 6];
                        return [5 /*yield**/, _loop_1(i)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, priclerPuppeteer_1.closeBrowser(browser)];
                    case 7:
                        _b.sent();
                        console.log(this.type + " done in " + stopwatch.stopTimer(helpers_1.STOPWATCH_FORMAT.SECS) + " seconds");
                        return [2 /*return*/];
                }
            });
        });
    };
    return Migroscrawler;
}());
exports.Migroscrawler = Migroscrawler;
