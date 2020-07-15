"use strict";
var _a;
exports.__esModule = true;
var migroscrawler_1 = require("./migroscrawler");
var notimplementedcrawler_1 = require("./notimplementedcrawler");
var lidlcrawler_1 = require("./lidlcrawler");
var coopcrawler_1 = require("./coopcrawler");
var migrosBaseUrl = 'https://produkte.migros.ch/sortiment/supermarkt';
var migrosPageUrl = '?page=';
var lildBaseUrl = 'https://sortiment.lidl.ch/de/alle-kategorien.html';
var lidlPageUrl = '?p=';
var aldiBaseUrl = 'https://www.aldi-suisse.ch/de/sortiment';
var coopBaseUrl = 'https://www.coop.ch/de/';
var CRAWLERTYPE;
(function (CRAWLERTYPE) {
    CRAWLERTYPE["MIGROS"] = "MIGROS";
    CRAWLERTYPE["COOP"] = "COOP";
    CRAWLERTYPE["ALDI"] = "ALDI";
    CRAWLERTYPE["LIDL"] = "LIDL";
})(CRAWLERTYPE = exports.CRAWLERTYPE || (exports.CRAWLERTYPE = {}));
exports.crawlerMap = (_a = {},
    _a[CRAWLERTYPE.MIGROS] = new migroscrawler_1.Migroscrawler(CRAWLERTYPE.MIGROS, migrosBaseUrl, migrosPageUrl),
    _a[CRAWLERTYPE.COOP] = new coopcrawler_1.Coopcrawler(CRAWLERTYPE.COOP, coopBaseUrl, ''),
    _a[CRAWLERTYPE.ALDI] = new notimplementedcrawler_1.Notimplementedcrawler(CRAWLERTYPE.ALDI),
    _a[CRAWLERTYPE.LIDL] = new lidlcrawler_1.Lidlcrawler(CRAWLERTYPE.LIDL, lildBaseUrl, lidlPageUrl),
    _a);
//# sourceMappingURL=crawler.js.map