"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notimplementedcrawler = void 0;
var Notimplementedcrawler = /** @class */ (function () {
    function Notimplementedcrawler(type) {
        this.type = type;
    }
    Notimplementedcrawler.prototype.crawl = function (amountOfPagesToCrawl) {
        console.log('crawler not implementet ', this.type);
        return Promise.resolve(undefined);
    };
    return Notimplementedcrawler;
}());
exports.Notimplementedcrawler = Notimplementedcrawler;
