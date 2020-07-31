import { Db, MongoClient, MongoError } from 'mongodb';
import { env, types } from 'pricler-types';

const MongoDB = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbname = 'pricler';

const PRODUCTS_COLLECTION = 'products';
const SHOPPINGLIST_COLLECTION = 'shoppinglist';

export class MongodbDatabase implements types.IDatabase {
    private static INSTANCE: MongodbDatabase;
    mongoClient: MongoClient;
    db: Db;

    private constructor() {
        MongoDB.connect(url, (err: MongoError, db: MongoClient) => {
            if (err) {
                console.error(err);
                console.error('exiting');
                process.exit();
            }
            if (env.debugMode()) {
                console.log('Connected to the pricler database.');
            }
            this.db = db.db(dbname);
            this.initializeSchema().then(() => {
                if (env.debugMode()) {
                    console.log('schemas initialized');
                }
            });
        });

        this.createOrUpdateProduct = this.createOrUpdateProduct.bind(this);
    }

    static instance(): MongodbDatabase {
        if (MongodbDatabase.INSTANCE) {
            return MongodbDatabase.INSTANCE;
        }
        MongodbDatabase.INSTANCE = new MongodbDatabase();
        return MongodbDatabase.INSTANCE;
    }

    initializeSchema(): Promise<any> {
        const callback = (res: any, rej: any) => (err: any) => (err ? console.log(err) : res());
        const products = new Promise<void>((resolve, reject) =>
            this.db.createCollection(
                PRODUCTS_COLLECTION,
                { validator: types.PODUCTS_VALIDATOR },
                callback(resolve, reject)
            )
        );
        const shoppinglist = new Promise<void>((resolve, reject) =>
            this.db.createCollection(
                SHOPPINGLIST_COLLECTION,
                { validator: types.SHOPPINGLIST_VALIDATOR },
                callback(resolve, reject)
            )
        );

        return Promise.all([products, shoppinglist]);
    }

    async close(): Promise<void> {
        if (this.mongoClient) {
            console.log('closing mongo db');
            await this.mongoClient.close();
        }
    }

    createOrUpdateProduct(product: types.Product) {
        const productsCollection = this.db.collection(PRODUCTS_COLLECTION);
        return productsCollection
            .updateOne(product, { $push: { prices: { $each: product.prices } } }, { upsert: true })
            .catch(() => console.log(product));
    }

    getProductCount(): Promise<{ count: number }> {
        const productsCollection = this.db.collection(PRODUCTS_COLLECTION);
        return new Promise<{ count: number }>((resolve, reject) => {
            productsCollection.countDocuments((error, result) => {
                if (error) {
                    reject();
                }
                resolve({ count: result });
            });
        });
    }

    mapOrder(order: string): number {
        return order === 'DESC' ? -1 : 1;
    }

    getProductsPagedAndSortedFiltered(
        filter: string,
        sort: string,
        order: string,
        start: number,
        end: number
    ): Promise<Array<types.Product>> {
        const collection = this.db.collection(PRODUCTS_COLLECTION);
        return collection
            .find({ name: new RegExp(`.*${filter}.*`, 'gi') })
            .sort({ [sort]: this.mapOrder(order) })
            .skip(start)
            .limit(end)
            .toArray();
    }

    getShoppingList(): Promise<types.Shoppinglist> {
        return Promise.resolve([]);
    }

    insertProductIntoShoppinglist({ id }: types.Product): Promise<number | null> {
        return Promise.resolve(undefined);
    }

    removeProductFromShoppinglist(id: string): Promise<number | null> {
        return Promise.resolve(undefined);
    }
}
