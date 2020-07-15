"use strict";
exports.__esModule = true;
var env_1 = require("../config/env");
var database_1 = require("../db/database");
var crawler_1 = require("./crawlers/crawler");
(function initializer() {
    var crawlers = env_1.activatedCrawlers()
        .map(function (crawlerString) { return crawler_1.crawlerMap[crawlerString].crawl(env_1.pagesFromEnv())["catch"](function (e) { return console.log('error in crawler: ', crawlerString, e); }); });
    Promise.all(crawlers).then(function () {
        console.log('closing db');
        database_1.closeDB();
        console.log('bye');
        process.exit();
    })["catch"](function (e) {
        console.log('error in a crawler: ', e);
        process.exit();
    });
})();
//# sourceMappingURL=index.js.map