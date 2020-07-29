"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../crawlerapp/db/database");
var express = require("express");
var app = express();
app.listen(3000, function () {
    console.log("Server running on port 3000");
});
app.get("/products/count", function (req, res) {
    return database_1.getProductCount().then(function (_a) {
        var count = _a.count;
        return res.json(count);
    });
});
app.get("/products", function (_a, res) {
    var query = _a.query;
    if (query) {
        var sort = query.sort, order = query.order, page = query.page, limit = query.limit, filter = query.filter;
        if (sort && order && page && limit) {
            var limitAsNumber = parseInt(limit);
            var pageAsNumber = parseInt(page);
            return database_1.getProductsPagedAndSorted(filter, sort, order, pageAsNumber * limitAsNumber, limitAsNumber)
                .then(function (products) {
                return res.json(products);
            })
                .catch(function (err) {
                return res.status(403).json(err);
            });
        }
    }
    return database_1.getProductsPaged(0, 100).then(function (products) {
        return res.json(products);
    });
});
