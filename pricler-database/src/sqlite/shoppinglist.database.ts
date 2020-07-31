import { all, run } from './functions';
import { Database } from 'sqlite3';
import { types } from 'pricler-types';

export function initializeShoppinglistDB(database: Database) {
    return Promise.all([
        run(
            database,
            'CREATE TABLE IF NOT EXISTS shoppinglist (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE NOT NULL UNIQUE)'
        ),
    ]);
}

export function getShoppingList(database: Database): Promise<types.Shoppinglist> {
    return all(database, 'SELECT p.* FROM shoppinglist s LEFT JOIN products p ON s.product_id = p.id');
}

export function insertProductIntoShoppinglist(database: Database, { id }: types.Product): Promise<number | null> {
    return run(database, 'INSERT INTO shoppinglist (product_id) VALUES (?)', [id]);
}

export function removeProductFromShoppinglist(database: Database, id: string): Promise<number | null> {
    return run(database, 'DELETE FROM shoppinglist WHERE product_id = ?', [id]);
}
