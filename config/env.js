"use strict";
exports.__esModule = true;
exports.runPuppeteerHeadless = exports.activatedCrawlers = exports.lidlActivated = exports.aldiActivated = exports.coopActivated = exports.migrosActivated = exports.pagesFromEnv = exports.debugMode = void 0;
var crawler_1 = require("../crawlerapp/crawlers/crawler");
function getProcessEnvironment() {
    return process.env;
}
function debugMode() {
    var DEBUG = getProcessEnvironment().DEBUG;
    return DEBUG === 'true';
}
exports.debugMode = debugMode;
function pagesFromEnv() {
    var PAGES = getProcessEnvironment().PAGES;
    return parseInt(PAGES);
}
exports.pagesFromEnv = pagesFromEnv;
function migrosActivated() {
    var CRAWLERS = getProcessEnvironment().CRAWLERS;
    return CRAWLERS.includes(crawler_1.CRAWLERTYPE.MIGROS);
}
exports.migrosActivated = migrosActivated;
function coopActivated() {
    var CRAWLERS = getProcessEnvironment().CRAWLERS;
    return CRAWLERS.includes(crawler_1.CRAWLERTYPE.COOP);
}
exports.coopActivated = coopActivated;
function aldiActivated() {
    var CRAWLERS = getProcessEnvironment().CRAWLERS;
    return CRAWLERS.includes(crawler_1.CRAWLERTYPE.ALDI);
}
exports.aldiActivated = aldiActivated;
function lidlActivated() {
    var CRAWLERS = getProcessEnvironment().CRAWLERS;
    return CRAWLERS.includes(crawler_1.CRAWLERTYPE.LIDL);
}
exports.lidlActivated = lidlActivated;
function activatedCrawlers() {
    var CRAWLERS = getProcessEnvironment().CRAWLERS;
    return CRAWLERS.split(',').map(function (str) { return crawler_1.CRAWLERTYPE[str]; });
}
exports.activatedCrawlers = activatedCrawlers;
function runPuppeteerHeadless() {
    var HEADLESS = getProcessEnvironment().HEADLESS;
    return HEADLESS === 'true';
}
exports.runPuppeteerHeadless = runPuppeteerHeadless;
//# sourceMappingURL=env.js.map