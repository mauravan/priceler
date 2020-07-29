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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stopwatch = exports.normalizedPrice = exports.containsNumber = exports.onlyNumbers = exports.onlyNumbersParsingToInt = exports.withoutHTMLTags = exports.withoutLeadingAndTrailingWhitespace = exports.retryAble = exports.STOPWATCH_FORMAT = void 0;
var STOPWATCH_FORMAT;
(function (STOPWATCH_FORMAT) {
    STOPWATCH_FORMAT[STOPWATCH_FORMAT["MILLIS"] = 1] = "MILLIS";
    STOPWATCH_FORMAT[STOPWATCH_FORMAT["SECS"] = 1000] = "SECS";
    STOPWATCH_FORMAT[STOPWATCH_FORMAT["MINS"] = 60000] = "MINS";
    STOPWATCH_FORMAT[STOPWATCH_FORMAT["HOURS"] = 3600000] = "HOURS";
})(STOPWATCH_FORMAT = exports.STOPWATCH_FORMAT || (exports.STOPWATCH_FORMAT = {}));
function retryAble(func, times, waiting) {
    if (times === void 0) { times = 3; }
    if (waiting === void 0) { waiting = 1000; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                return [2 /*return*/, func()];
            }
            catch (e) {
                console.log("could not execute request will retry: ", times, " times");
                console.error(e);
                if (times > 0) {
                    return [2 /*return*/, new Promise(function (resolve) {
                            setTimeout(function () {
                                resolve(retryAble(func, times - 1));
                            }, waiting);
                        })];
                }
                console.log("could not execute request giving up");
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
exports.retryAble = retryAble;
function withoutLeadingAndTrailingWhitespace(text) {
    return text.trim();
}
exports.withoutLeadingAndTrailingWhitespace = withoutLeadingAndTrailingWhitespace;
function withoutHTMLTags(text) {
    return text ? text.replace(/<[^>]*>/g, "") : "";
}
exports.withoutHTMLTags = withoutHTMLTags;
function onlyNumbersParsingToInt(text) {
    return parseInt(onlyNumbers(text), 10);
}
exports.onlyNumbersParsingToInt = onlyNumbersParsingToInt;
function onlyNumbers(text) {
    return text.replace(/\D/g, "");
}
exports.onlyNumbers = onlyNumbers;
function containsNumber(str) {
    return /\d/.test(str);
}
exports.containsNumber = containsNumber;
function normalizedPrice(price, quantity) {
    if (price && quantity) {
        return price / quantity;
    }
    return 0;
}
exports.normalizedPrice = normalizedPrice;
var Stopwatch = /** @class */ (function () {
    function Stopwatch() {
        this.startTime = new Date();
    }
    Stopwatch.prototype.startTimer = function () {
        this.startTime = new Date();
    };
    Stopwatch.prototype.stopTimer = function (format) {
        if (format === void 0) { format = STOPWATCH_FORMAT.MILLIS; }
        return (new Date().getTime() - this.startTime.getTime()) / format;
    };
    return Stopwatch;
}());
exports.Stopwatch = Stopwatch;
