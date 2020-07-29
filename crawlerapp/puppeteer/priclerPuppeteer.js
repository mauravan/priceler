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
exports.autoScroll = exports.closeBrowser = exports.closePage = exports.navigateToUrl = exports.openNewPage = exports.initializeBrowser = void 0;
var helpers_1 = require("../../config/helpers");
var priclerPuppeteer = require('puppeteer');
require('dotenv').config();
var puppeteerConfig = {
    timeout: 120000,
    headless: process.env.HEADLESS === 'true',
    args: ['--disable-dev-shm-usage', '--no-sandbox',]
};
function initializeBrowser() {
    return priclerPuppeteer.launch(puppeteerConfig);
}
exports.initializeBrowser = initializeBrowser;
function attachErrorHandlerToPage(page) {
    page.on('requestfailed', function (request) {
        console.log("url: " + request.url() + ", errText: " + request.failure().errorText + ", method: " + request.method());
    });
    // Catch console log errors
    page.on("pageerror", function (err) {
        console.log("Page error: " + err.toString());
    });
    return page;
}
function openNewPage(browser) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (browser) {
                return [2 /*return*/, browser.newPage().then(attachErrorHandlerToPage)];
            }
            return [2 /*return*/];
        });
    });
}
exports.openNewPage = openNewPage;
function navigateToUrl(page, url, browser) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            console.log('navigating to url: ' + url);
            return [2 /*return*/, helpers_1.retryAble(function () { return page.goto(url, { waitUntil: 'load', timeout: 0 })["catch"](function (err) { return __awaiter(_this, void 0, void 0, function () {
                    var newPage;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('error in navigation, reopening page: ', err);
                                return [4 /*yield*/, closePage(page)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, openNewPage(browser)];
                            case 2:
                                newPage = _a.sent();
                                return [2 /*return*/, navigateToUrl(newPage, url, browser)];
                        }
                    });
                }); }); })];
        });
    });
}
exports.navigateToUrl = navigateToUrl;
function closePage(page) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, page.close()];
        });
    });
}
exports.closePage = closePage;
function closeBrowser(browser) {
    console.log('closing browser');
    if (browser) {
        return browser.close();
    }
}
exports.closeBrowser = closeBrowser;
function autoScroll(page) {
    return page.evaluate(function () {
        return new Promise(function (resolve) {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(function () {
                var scrollHeight = document.body.scrollHeight;
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
exports.autoScroll = autoScroll;
//# sourceMappingURL=priclerPuppeteer.js.map