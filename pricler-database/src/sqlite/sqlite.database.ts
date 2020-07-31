import { Database } from 'sqlite3';
import {
    createOrUpdateProduct,
    getProductCount,
    getProductsPagedAndSorted,
    initializeProductsDB,
} from './products.database';
import {
    getShoppingList,
    initializeShoppinglistDB,
    insertProductIntoShoppinglist,
    removeProductFromShoppinglist,
} from './shoppinglist.database';
import { types, env } from 'pricler-types';

const sqlite3 = require('sqlite3');
const DATABASE_PATH = './crawlerapp/db/sqlite/pricler.db';

export class SqliteDatabase implements types.IDatabase {
    private static INSTANCE: SqliteDatabase;
    db: Database;

    private constructor() {
        this.db = new sqlite3.Database(DATABASE_PATH, sqlite3.OPEN_READWRITE, (err: Error | null) => {
            if (err) {
                console.error(err);
                console.error('exiting');
                process.exit();
            }
            if (env.debugMode()) {
                console.log('Connected to the pricler database.');
            }
        });
        if (env.debugMode()) {
            console.log(process.cwd());
            this.db.on('trace', console.log);
        }

        Promise.all([initializeProductsDB(this.db), initializeShoppinglistDB(this.db)]).then(() => {
            if (env.debugMode()) {
                console.log('sqldb initialized');
            }
        });
    }

    static instance(): SqliteDatabase {
        if (SqliteDatabase.INSTANCE) {
            return SqliteDatabase.INSTANCE;
        }
        SqliteDatabase.INSTANCE = new SqliteDatabase();
        return SqliteDatabase.INSTANCE;
    }

    close(): void {
        if (this.db) {
            console.log('closing sqlite db');
            this.db.close();
        }
    }

    createOrUpdateProduct(product: types.Product): Promise<number> {
        return createOrUpdateProduct(this.db, product);
    }

    getProductCount(): Promise<{ count: number }> {
        return getProductCount(this.db);
    }

    getProductsPagedAndSortedFiltered(
        filter: string,
        sort: string,
        order: string,
        start: number,
        end: number
    ): Promise<Array<types.Product>> {
        return getProductsPagedAndSorted(this.db, filter, sort, order, start, end);
    }

    getShoppingList(): Promise<types.Shoppinglist> {
        return getShoppingList(this.db);
    }

    insertProductIntoShoppinglist(product: types.Product): Promise<number | null> {
        return insertProductIntoShoppinglist(this.db, product);
    }

    removeProductFromShoppinglist(id: string): Promise<number | null> {
        return removeProductFromShoppinglist(this.db, id);
    }
}
