import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { types } from 'pricler-types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ShoppinglistService {
    constructor(private http: HttpClient, private zone: NgZone) {}

    private lastRecievedList: types.Shoppinglist;

    getShoppingList(): Observable<types.Shoppinglist> {
        return new Observable<types.Shoppinglist>((observer) => {
            const eventSource = new EventSource('/shoppinglist');
            eventSource.onmessage = (event) => {
                if (event.data) {
                    this.zone.run(() => {
                        this.lastRecievedList = JSON.parse(event.data);
                        observer.next(this.lastRecievedList);
                    });
                }
            };
            eventSource.onerror = (error) => {
                this.zone.run(() => {
                    observer.error(error);
                });
            };
        });
    }

    addProductToShoppingList(product: types.Product): Observable<string> {
        return this.http.post<string>(`/shoppinglist/${this.lastRecievedList._id}`, product);
    }

    removeProductFromShoppingList(id, { _id: productid }: types.Product): Observable<any> {
        return this.http.delete(`/shoppinglist/${id}/${productid}`);
    }
}
