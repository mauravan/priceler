import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { ProductsDataSource } from './products.data.source';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['id', 'name', 'retailer', 'price', 'quantity'];
  dataSource: ProductsDataSource;
  productsCount: Observable<number>;
  keyUpObservable: Subscription;
  mergedSubscription: Subscription;
  value: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.dataSource = new ProductsDataSource(this.http);
    this.productsCount = this.dataSource.loadProductsCount();
  }

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    const keyUpObservable = fromEvent(this.input.nativeElement, 'keyup').pipe(
      debounceTime(150),
      distinctUntilChanged()
    );
    this.keyUpObservable = keyUpObservable.subscribe(
      () => (this.paginator.pageIndex = 0)
    );

    this.mergedSubscription = merge(
      this.sort.sortChange,
      this.paginator.page,
      keyUpObservable
    )
      .pipe(
        tap(() => {
          return this.dataSource.loadProducts(
            this.input.nativeElement.value,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize
          );
        })
      )
      .subscribe();

    this.dataSource.loadProducts(
      this.input.nativeElement.value,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  ngOnDestroy(): void {
    if (this.keyUpObservable) {
      this.keyUpObservable.unsubscribe();
    }
    if (this.mergedSubscription) {
      this.mergedSubscription.unsubscribe();
    }
  }
}
