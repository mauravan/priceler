import {Product} from "../../../../types/types";
import {BehaviorSubject, Observable, of} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, finalize} from "rxjs/operators";
import {CollectionViewer, DataSource} from "@angular/cdk/collections";

export class ProductsDataSource implements DataSource<Product> {

  private productsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  connect(collectionViewer: CollectionViewer): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.productsSubject.complete();
    this.loadingSubject.complete();
  }

  loadProducts(pageIndex: number, pageSize: number): void {
    this.loadingSubject.next(true);

    this.findProducts(pageIndex, pageSize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(products => this.productsSubject.next(products));
  }

  findProducts(pageNumber = 0, pageSize = 3): Observable<Product[]> {
    return this.http.get<Array<Product>>('/products', {
      params: new HttpParams()
        .set('page', pageNumber.toString())
        .set('limit', pageSize.toString())
    });
  }
}
