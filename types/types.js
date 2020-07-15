"use strict";
exports.__esModule = true;
exports.isPromoted = exports.RETAILER = void 0;
var RETAILER;
(function (RETAILER) {
    RETAILER[RETAILER["MIGROS"] = 0] = "MIGROS";
    RETAILER[RETAILER["COOP"] = 1] = "COOP";
    RETAILER[RETAILER["ALDI"] = 2] = "ALDI";
    RETAILER[RETAILER["LIDL"] = 3] = "LIDL";
})(RETAILER = exports.RETAILER || (exports.RETAILER = {}));
function isPromoted(price) {
    return price.original_price != null;
}
exports.isPromoted = isPromoted;
//# sourceMappingURL=types.js.map