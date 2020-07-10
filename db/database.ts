import {Database} from "sqlite3";
import {Product} from "../config/types";

const sqlite3 = require('sqlite3').verbose();
let db: Database;

function run(sql: string, params: any[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve(this.lastID)
            }
        })
    })
}

function get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.log('Error running sql: ' + sql)
                console.log(err)
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

function all(sql: string, params: any[] = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Error running sql: ' + sql)
                console.log(err)
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

(async function initializeDB() {
    db = new sqlite3.Database('./db/pricler.db', sqlite3.OPEN_READWRITE, (err: Error | null) => {
        if (err) {
            console.error(err);
            console.error('exiting');
            process.exit()
        }
        console.log('Connected to the pricler database.');
    });
    await run('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, external_id INTEGER NOT NULL , name VARCHAR(255) UNIQUE ON CONFLICT ROLLBACK, retailer VARCHAR(255))');
    await run('CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE, price INTEGER NOT NULL, date DATE NOT NULL, original_price INTEGER, quantity VARCHAR(255))');
})()

async function update({name, prices: [price]}: Product): Promise<number> {
    const product = await getProductByName(name);
    await run('INSERT INTO prices (product_id, price, date, original_price, quantity) VALUES (?, ?, ?, ?, ?)', [product.id, price.price, new Date(), price.original_price, price.quantity])
    return product.id;
}

function insert({name, retailer, externalId, prices: [price]}: Product): Promise<number> {
    return run('INSERT INTO products (name, external_id, retailer) VALUES (?, ?, ?)', [name, externalId, retailer]).then(id => {
        return run('INSERT INTO prices (product_id, price, date, original_price, quantity) VALUES (?, ?, ?, ?, ?)', [id, price.price, new Date(), price.original_price, price.quantity]).then(() => id)
    })
}

export function createOrUpdateProduct(product: Product): Promise<number> {
    return insert(product).catch(err => {
        if (err.code === 'SQLITE_CONSTRAINT') {
            return update(product);
        }
    })
}

export async function getProductByName(name: string): Promise<Product> {
    const product = await get('SELECT * FROM products WHERE name = ?', [name]);
    if (product) {
        const prices = await all('SELECT * FROM prices where product_id = ?', [product.id])
        return {...product, prices};
    }
    return Promise.reject('Product not found');
}

export function closeDB() {
    if (db) {
        db.close()
    }
}
