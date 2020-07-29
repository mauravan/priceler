import {FlatProduct} from '../../../../types/types';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, finalize} from 'rxjs/operators';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {SortDirection} from '@angular/material/sort';

export class ProductsDataSource implements DataSource<FlatProduct> {

  private productsSubject = new BehaviorSubject<FlatProduct[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatProduct[]> {
    return this.productsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.productsSubject.complete();
    this.loadingSubject.complete();
  }

  loadProducts(filter: string, sort: string, order: SortDirection, pageIndex: number, pageSize: number): void {
    this.loadingSubject.next(true);

    this.findProducts(filter, sort, order, pageIndex, pageSize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(products => this.productsSubject.next(products));
  }

  findProducts(filter: string, sort: string, order: SortDirection, pageNumber = 0, pageSize = 3): Observable<FlatProduct[]> {
    return this.http.get<Array<FlatProduct>>('/products', {
      params: new HttpParams()
        .set('filter', filter.toString())
        .set('sort', sort)
        .set('order', order)
        .set('page', pageNumber.toString())
        .set('limit', pageSize.toString())
    });
  }

  loadProductsCount(): Observable<number> {
    return this.http.get<number>('/products/count');
  }
}
