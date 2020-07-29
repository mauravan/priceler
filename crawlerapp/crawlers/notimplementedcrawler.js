"use strict";
exports.__esModule = true;
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
//# sourceMappingURL=notimplementedcrawler.js.map