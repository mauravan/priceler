import { Component, OnInit } from '@angular/core';
import { ShoppinglistService } from './shoppinglist.service';
import { types } from 'pricler-types';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-shoppinglist',
    templateUrl: './shoppinglist.component.html',
    styleUrls: ['./shoppinglist.component.scss'],
})
export class ShoppinglistComponent implements OnInit {
    shoppingList$: Observable<types.Shoppinglist>;

    constructor(private shoppinglistService: ShoppinglistService) {}

    ngOnInit(): void {
        this.shoppingList$ = this.shoppinglistService.getShoppingList().pipe(
            catchError((err) => {
                console.log(err);
                return [];
            })
        );
    }

    removeProductFromShoppingList(shoppinglistId, product): void {
        this.shoppinglistService.removeProductFromShoppingList(shoppinglistId, product).subscribe();
    }
}
