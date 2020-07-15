import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MatPaginator} from '@angular/material/paginator';
import {ProductsDataSource} from "./products.data.source";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  displayedColumns: string[] = ['name', 'retailer'];
  dataSource;

  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.dataSource = new ProductsDataSource(this.http);
    this.dataSource.loadProducts(0, 5);
  }

}
