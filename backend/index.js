"use strict";
exports.__esModule = true;
var database_1 = require("../db/database");
var express = require("express");
var app = express();
app.listen(3000, function () {
    console.log("Server running on port 3000");
});
app.get("/products", function (req, res) {
    if (req.query && req.query.limit && req.query.page) {
        var limit = parseInt(req.query.limit);
        var page = parseInt(req.query.page);
        return database_1.getProductsPaged(page * limit, limit).then(function (products) {
            return res.json(products);
        });
    }
    return database_1.getProductsPaged(0, 100).then(function (products) {
        return res.json(products);
    });
});
