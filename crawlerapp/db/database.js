"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.closeDB = exports.getProductByName = exports.getProductsPagedAndSorted = exports.getProductsPaged = exports.getProductCount = exports.createOrUpdateProduct = void 0;
var sqlite3 = require("sqlite3").verbose();
var DATABASE_PATH = "./crawlerapp/db/pricler.db";
var db;
function run(sql, params) {
    if (params === void 0) { params = []; }
    return new Promise(function (resolve, reject) {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.lastID);
            }
        });
    });
}
function get(sql, params) {
    if (params === void 0) { params = []; }
    return new Promise(function (resolve, reject) {
        db.get(sql, params, function (err, result) {
            if (err) {
                console.log("Error running sql: " + sql);
                console.log(err);
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
function all(sql, params) {
    if (params === void 0) { params = []; }
    return new Promise(function (resolve, reject) {
        db.all(sql, params, function (err, rows) {
            if (err) {
                console.log("Error running sql: " + sql);
                console.log(err);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
(function initializeDB() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(process.cwd());
                    db = new sqlite3.Database(DATABASE_PATH, sqlite3.OPEN_READWRITE, function (err) {
                        if (err) {
                            console.error(err);
                            console.error("exiting");
                            process.exit();
                        }
                        console.log("Connected to the pricler database.");
                    });
                    return [4 /*yield*/, run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, external_id INTEGER NOT NULL , name VARCHAR(255) UNIQUE ON CONFLICT ROLLBACK, retailer INTEGER, category VARCHAR(255))")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, run("CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE, price INTEGER NOT NULL, date DATE NOT NULL, original_price INTEGER, quantity INTEGER, unit VARCHAR(255), normalized_price INTEGER)")];
                case 2:
                    _a.sent();
                    db.on("trace", console.log);
                    return [2 /*return*/];
            }
        });
    });
})();
function update(_a) {
    var name = _a.name, price = _a.prices[0];
    return __awaiter(this, void 0, void 0, function () {
        var product, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getProductByName(name)];
                case 1:
                    product = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, run("INSERT INTO prices (product_id, price, date, original_price, quantity, unit, normalized_price) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                            product.id,
                            price.price,
                            new Date(),
                            price.original_price,
                            price.quantity,
                            price.unit,
                            price.normalized_price,
                        ])];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    console.log("could not update product, ", this.args[0], "beacuse: ", e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, product.id];
            }
        });
    });
}
function insert(_a) {
    var _this = this;
    var name = _a.name, retailer = _a.retailer, externalId = _a.externalId, category = _a.category, price = _a.prices[0];
    return run("INSERT INTO products (name, external_id, retailer, category) VALUES (?, ?, ?, ?)", [name, externalId, retailer, category])
        .then(function (id) {
        return run("INSERT INTO prices (product_id, price, date, original_price, quantity, unit, normalized_price) VALUES (?, ?, ?, ?, ?, ?, ?)", [
            id,
            price.price,
            new Date(),
            price.original_price,
            price.quantity,
            price.unit,
            price.normalized_price,
        ]).then(function () { return id; });
    })["catch"](function (e) {
        console.log("could not insert product, ", _this.args[0], "beacuse: ", e);
        return null;
    });
}
function createOrUpdateProduct(product) {
    return insert(product)["catch"](function (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
            return update(product);
        }
    });
}
exports.createOrUpdateProduct = createOrUpdateProduct;
function getProductCount() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("SELECT COUNT(*) as count FROM products")];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getProductCount = getProductCount;
function getProductsPaged(start, end) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, all("SELECT products.name, products.retailer, p.price, p.quantity\n                FROM products\n                LEFT JOIN prices p on products.id = p.product_id\n                WHERE products.id > ?\n                ORDER BY products.id\n                LIMIT ?, ?;", [start, end])];
        });
    });
}
exports.getProductsPaged = getProductsPaged;
var sortableProperties = {
    id: "products.id",
    name: "products.name",
    retailer: "products.retailer",
    price: "p.price",
};
function getProductsPagedAndSorted(filter, sort, order, start, end) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!["ASC", "DESC", ""].includes(order.toUpperCase())) {
                return [2 /*return*/, Promise.reject("only ASC or DESC allowed")];
            }
            return [2 /*return*/, all("SELECT products.id, products.name, products.retailer, p.price, p.quantity\n                FROM products\n                LEFT JOIN prices p on products.id = p.product_id\n                WHERE products.name LIKE $filter\n                ORDER BY " + sortableProperties[sort] + " " + order + "\n                LIMIT $start, $end;", { $start: start, $end: end, $filter: "%" + filter + "%" })];
        });
    });
}
exports.getProductsPagedAndSorted = getProductsPagedAndSorted;
function getProductByName(name) {
    return __awaiter(this, void 0, void 0, function () {
        var product, prices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get("SELECT * FROM products WHERE name = ?", [name])];
                case 1:
                    product = _a.sent();
                    if (!product) return [3 /*break*/, 3];
                    return [4 /*yield*/, all("SELECT * FROM prices where product_id = ?", [
                            product.id,
                        ])];
                case 2:
                    prices = _a.sent();
                    return [2 /*return*/, __assign(__assign({}, product), { prices: prices })];
                case 3: return [2 /*return*/, Promise.reject("Product not found")];
            }
        });
    });
}
exports.getProductByName = getProductByName;
function closeDB() {
    if (db) {
        db.close();
    }
}
exports.closeDB = closeDB;
//# sourceMappingURL=database.js.map