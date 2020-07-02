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
var puppeteer = require('puppeteer');
var fs = require('fs');
var migros = 'https://produkte.migros.ch/sortiment/supermarkt';
var migrosNextButtonSelector = 'button[data-testid="msrc-articles--pagination-link-next"]';
var migrosArticleSelector = 'article[data-testid="msrc-articles--article"]';
var migrosFileName = 'migrosData.csv';
var pageCount = 0;
var puppeteerConfig = {
    timeout: 120000,
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox',]
};
function initializeBrowser(config) {
    console.log('launching browser');
    return puppeteer.launch(config);
}
function initializePage(browser, url) {
    return __awaiter(this, void 0, void 0, function () {
        var page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('opening new page');
                    return [4 /*yield*/, browser.newPage()];
                case 1:
                    page = _a.sent();
                    console.log('navigation to url: ', url);
                    return [4 /*yield*/, page.goto(url)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, page];
            }
        });
    });
}
function getDataForPage(page, selector) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('loading data for page: ', pageCount++);
                    return [4 /*yield*/, page.waitFor('article', { timeout: 5000 })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, page.evaluate(function (selector) {
                            return Array.from(document.querySelectorAll(selector), function (article) { return article.innerText; });
                        }, selector)];
            }
        });
    });
}
function hasMorePages(page, selector) {
    return __awaiter(this, void 0, void 0, function () {
        var isDisabled, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, page.waitForSelector(selector, { timeout: 5000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.$eval(selector, function (button) {
                            return button.disabled;
                        })];
                case 2:
                    isDisabled = _a.sent();
                    return [2 /*return*/, !isDisabled];
                case 3:
                    error_1 = _a.sent();
                    console.log("No more pages found");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
function nextPage(page, selector) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.$eval(selector, function (el) { return el.click(); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function cleanPrice(price) {
    var splitPrice = price.split('.');
    var afterComma = parseInt(splitPrice[1]);
    if (isNaN(afterComma)) {
        return parseFloat(splitPrice[0].replace('/(?!\.)\D/g', '') + '.00');
    }
    return parseFloat(splitPrice[0] + "." + afterComma.toString().padStart(2, '0'));
}
function parseMigrosArticle(article) {
    var splitupArticleStrings = article.split('\n');
    var price = cleanPrice(splitupArticleStrings[0]);
    var isPromoted = splitupArticleStrings[1].includes('statt');
    var name = isPromoted ? splitupArticleStrings[2] : splitupArticleStrings[1];
    var oldPrice = isPromoted ? cleanPrice(splitupArticleStrings[1].split(' ')[1]) : null;
    if (isPromoted) {
        return {
            price: price,
            isPromoted: isPromoted,
            name: name,
            oldPrice: oldPrice
        };
    }
    return {
        price: price,
        name: name,
        isPromoted: isPromoted
    };
}
function listedArticleToLine(_a) {
    var name = _a.name, price = _a.price, oldPrice = _a.oldPrice;
    return name + "\t" + price + "\t" + oldPrice + "\n";
}
function stringArrayToString(listedArticles) {
    return listedArticles.map(listedArticleToLine).join('');
}
function writeMigrosDataToCsv(fileName, data, callback) {
    fs.writeFileSync(fileName, stringArrayToString(data), callback);
}
function writeToFileCallback(err) {
    if (err) {
        console.error('could not write data ', err);
    }
    console.log('wrote Data to migrosData.csv');
}
function appendMigrosDataToCsv(fileName, data, callback) {
    fs.appendFileSync(fileName, stringArrayToString(data), callback);
}
function combineDataFromAllPagesWritingInBetweenPages(page) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    writeMigrosDataToCsv(migrosFileName, [], writeToFileCallback);
                    _e.label = 1;
                case 1: return [4 /*yield*/, hasMorePages(page, migrosNextButtonSelector)];
                case 2:
                    if (!_e.sent()) return [3 /*break*/, 5];
                    _a = appendMigrosDataToCsv;
                    _b = [migrosFileName];
                    return [4 /*yield*/, getDataForPage(page, migrosArticleSelector)];
                case 3:
                    _a.apply(void 0, _b.concat([(_e.sent()).map(parseMigrosArticle), writeToFileCallback]));
                    return [4 /*yield*/, nextPage(page, migrosNextButtonSelector)];
                case 4:
                    _e.sent();
                    return [3 /*break*/, 1];
                case 5:
                    _c = appendMigrosDataToCsv;
                    _d = [migrosFileName];
                    return [4 /*yield*/, getDataForPage(page, migrosArticleSelector)];
                case 6:
                    _c.apply(void 0, _d.concat([(_e.sent()).map(parseMigrosArticle), writeToFileCallback]));
                    return [2 /*return*/];
            }
        });
    });
}
(function doGiveMeTheArticles() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeBrowser(puppeteerConfig)];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, initializePage(browser, migros)];
                case 2:
                    page = _a.sent();
                    return [4 /*yield*/, combineDataFromAllPagesWritingInBetweenPages(page)];
                case 3:
                    _a.sent();
                    console.log('done, closing browser');
                    return [4 /*yield*/, browser.close()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}());
