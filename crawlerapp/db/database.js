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
exports.initializeDB = exports.closeDB = exports.all = exports.get = exports.run = void 0;
var env_1 = require("../../config/env");
var products_database_1 = require("./products.database");
var shoppinglist_database_1 = require("./shoppinglist.database");
var sqlite3 = require("sqlite3");
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
exports.run = run;
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
exports.get = get;
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
exports.all = all;
function closeDB() {
    if (db) {
        db.close();
    }
}
exports.closeDB = closeDB;
function initializeDB() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    db = new sqlite3.Database(DATABASE_PATH, sqlite3.OPEN_READWRITE, function (err) {
                        if (err) {
                            console.error(err);
                            console.error("exiting");
                            process.exit();
                        }
                        if (env_1.debugMode()) {
                            console.log("Connected to the pricler database.");
                        }
                    });
                    if (env_1.debugMode()) {
                        console.log(process.cwd());
                        db.on("trace", console.log);
                    }
                    return [4 /*yield*/, products_database_1.initializeProductsDB()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, shoppinglist_database_1.initializeShoppinglistDB()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.initializeDB = initializeDB;
