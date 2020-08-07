import { Db, FindAndModifyWriteOpResultObject, MongoClient, MongoError, UpdateWriteOpResult } from 'mongodb';
import { env, types } from 'pricler-types';

const MongoDB = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbname = 'pricler';

const PRODUCTS_COLLECTION = 'products';
const PRICES_COLLECTION = 'prices';
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
        const callback = (res: any, _: any) => (err: any) => (err?.code !== 48 ? console.log(err) : res());
        const products = new Promise<void>((resolve, reject) =>
            this.db.createCollection(
                PRODUCTS_COLLECTION,
                { validator: types.PODUCTS_VALIDATOR, collation: { locale: 'de' } },
                callback(resolve, reject)
            )
        );
        const prices = new Promise<void>((resolve, reject) =>
            this.db.createCollection(
                PRICES_COLLECTION,
                { validator: types.PRICES_VALIDATOR, collation: { locale: 'de' } },
                callback(resolve, reject)
            )
        );
        const shoppinglist = new Promise<void>((resolve, reject) =>
            this.db.createCollection(
                SHOPPINGLIST_COLLECTION,
                { validator: types.SHOPPINGLIST_VALIDATOR, collation: { locale: 'de' } },
                callback(resolve, reject)
            )
        );

        return Promise.all([products, prices, shoppinglist]);
    }

    async close(): Promise<void> {
        if (this.mongoClient) {
            console.log('closing mongo db');
            await this.mongoClient.close();
        }
    }

    async createOrUpdateProduct({ prices, ...rest }: types.Product) {
        if (prices.length === 0) {
            console.log(rest, ' does not have prices: ', prices);
        }

        const productsCollection = this.db.collection(PRODUCTS_COLLECTION);
        const pricesCollection = this.db.collection(PRICES_COLLECTION);
        const result = await productsCollection
            .findOneAndUpdate(rest, { $set: rest }, { returnOriginal: false, upsert: true })
            .catch((e) => console.log('cannot insert: ', rest, e));
        if ((result as FindAndModifyWriteOpResultObject<any>)?.ok) {
            return pricesCollection
                .insertOne({ ...prices[0], product_id: (result as FindAndModifyWriteOpResultObject<any>).value._id })
                .catch((e) =>
                    console.log(
                        'cannot insert: ',
                        { ...prices[0], product_id: (result as FindAndModifyWriteOpResultObject<any>).value._id },
                        result,
                        e
                    )
                );
        } else {
            console.log('could not insert prices to product: ', rest, ' result from db: ', result);
        }
        return result;
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
        return order.toUpperCase() === 'DESC' ? -1 : 1;
    }

    getProductsPagedAndSortedFiltered(
        filter: string,
        sort: string,
        order: string,
        start: number,
        end: number
    ): Promise<Array<types.FlatProduct>> {
        const collection = this.db.collection(PRODUCTS_COLLECTION);

        if(['price', 'quantity', 'unit', 'normalized_price'].includes(sort)) {
            const priceCollection = this.db.collection(PRICES_COLLECTION);
            return priceCollection.aggregate([
                { $sort: { [sort]: this.mapOrder(order) } },
                {
                    $lookup: {
                        from: PRODUCTS_COLLECTION,
                        localField: 'product_id',
                        foreignField: '_id',
                        as: 'products'

                    },
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$products', 0] }, '$$ROOT'] } },
                },
                {
                    $project: {
                        'products': false,
                    },
                },
                { $match: { name: new RegExp(`.*${filter}.*`, 'gi') } },
                { $skip: start },
                { $limit: end },
            ]).toArray()
        }

        return collection
            .aggregate([
                { $match: { name: new RegExp(`.*${filter}.*`, 'gi') } },
                { $sort: { [sort]: this.mapOrder(order) } },
                { $skip: start },
                { $limit: end },
                {
                    $lookup: {
                        from: PRICES_COLLECTION,
                        let: { priceid: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$$priceid', '$product_id'] } } },
                            { $sort: { date: -1 } },
                            { $limit: 1 },
                        ],
                        as: 'lookup-latest',
                    },
                },
                {
                    $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$lookup-latest', 0] }, '$$ROOT'] } },
                },
                {
                    $project: {
                        'lookup-latest': false,
                    },
                },
            ])
            .toArray();
    }

    // TODO: Use ID with USER
    async getShoppingList(id: string): Promise<types.Shoppinglist> {
        const shoppinglistCollection = this.db.collection(SHOPPINGLIST_COLLECTION);
        const res = await shoppinglistCollection.find().toArray();
        if (res.length === 0) {
            const insertedShoppinglist = await shoppinglistCollection.insertOne(
                { products: [] },
                { forceServerObjectId: false }
            );
            return insertedShoppinglist.ops[0];
        }

        return res[0];
    }

    insertProductIntoShoppinglist(shoppinglistid: string, product: types.Product): Promise<void | UpdateWriteOpResult> {
        const shoppinglistCollection = this.db.collection(SHOPPINGLIST_COLLECTION);
        return shoppinglistCollection
            .updateOne({ _id: shoppinglistid }, { $addToSet: { products: product } }, { upsert: true })
            .catch(() => console.log(product));
    }

    removeProductFromShoppinglist(shoppinglistid: string, productId: string): Promise<void | UpdateWriteOpResult> {
        const shoppinglistCollection = this.db.collection(SHOPPINGLIST_COLLECTION);
        return shoppinglistCollection
            .updateOne({ _id: shoppinglistid }, { $pull: { products: { _id: productId } } })
            .catch(() => console.log(productId));
    }
}
