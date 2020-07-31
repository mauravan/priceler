import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableComponent } from './table/table.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShoppinglistComponent } from './shoppinglist/shoppinglist.component';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { TableConfiguratorComponent } from './table/table-configurator/table-configurator.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [AppComponent, TableComponent, ShoppinglistComponent, TableConfiguratorComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatTableModule,
        HttpClientModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatInputModule,
        MatIconModule,
        FormsModule,
        MatListModule,
        MatCardModule,
        MatCheckboxModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
