"use strict";
exports.__esModule = true;
exports.LessonsDataSource = exports.ProductsDataSource = void 0;
var rxjs_1 = require("rxjs");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var ProductsDataSource = /** @class */ (function () {
    function ProductsDataSource(http) {
        this.http = http;
        this.productsSubject = new rxjs_1.BehaviorSubject([]);
        this.loadingSubject = new rxjs_1.BehaviorSubject(false);
        this.loading$ = this.loadingSubject.asObservable();
    }
    ProductsDataSource.prototype.connect = function (collectionViewer) {
        return this.productsSubject.asObservable();
    };
    ProductsDataSource.prototype.disconnect = function (collectionViewer) {
        this.productsSubject.complete();
        this.loadingSubject.complete();
    };
    ProductsDataSource.prototype.loadProducts = function (pageIndex, pageSize) {
        var _this = this;
        this.loadingSubject.next(true);
        this.findProducts(pageIndex, pageSize).pipe(operators_1.catchError(function () { return rxjs_1.of([]); }), operators_1.finalize(function () { return _this.loadingSubject.next(false); }))
            .subscribe(function (products) { return _this.productsSubject.next(products); });
    };
    ProductsDataSource.prototype.findProducts = function (pageNumber, pageSize) {
        if (pageNumber === void 0) { pageNumber = 0; }
        if (pageSize === void 0) { pageSize = 3; }
        return this.http.get('/products', {
            params: new http_1.HttpParams()
                .set('page', pageNumber.toString())
                .set('limit', pageSize.toString())
        });
    };
    return ProductsDataSource;
}());
exports.ProductsDataSource = ProductsDataSource;
var LessonsDataSource = /** @class */ (function () {
    function LessonsDataSource(coursesService) {
        this.coursesService = coursesService;
        this.lessonsSubject = new rxjs_1.BehaviorSubject([]);
    }
    LessonsDataSource.prototype.connect = function (collectionViewer) {
    };
    LessonsDataSource.prototype.disconnect = function (collectionViewer) {
    };
    LessonsDataSource.prototype.loadLessons = function (courseId, filter, sortDirection, pageIndex, pageSize) {
    };
    return LessonsDataSource;
}());
exports.LessonsDataSource = LessonsDataSource;
//# sourceMappingURL=products.data.source.js.map