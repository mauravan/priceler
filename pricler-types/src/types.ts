export interface MigrosArticle {
    id: string;
    name: string;
    meta: {
        price: number;
        original_price: number;
    };
    price_info: {
        quantity: string;
        price: string;
        original_price: string;
    };
    product_tile_infos: {
        price_sub_text: string;
    };
    categories: Array<{ code: string; name: string }>;
}

export enum CRAWLERTYPE {
    MIGROS = 'MIGROS',
    COOP = 'COOP',
    ALDI = 'ALDI',
    LIDL = 'LIDL',
}

export enum DBTYPE {
    SQLITE = 'SQLITE',
    MONGO = 'MONGO',
}

export enum RETAILER {
    MIGROS,
    COOP,
    ALDI,
    LIDL,
}

export const UNITS = {
    g: 100,
    l: 1,
    kg: 0.1,
    ml: 10,
};

export const RETAILER_TO_NAME = {
    [RETAILER.MIGROS]: 'Migros',
    [RETAILER.COOP]: 'Coop',
    [RETAILER.LIDL]: 'Lidl',
    [RETAILER.ALDI]: 'Aldi',
};

export interface IDatabase {
    close(): void;
    createOrUpdateProduct(product: Product): Promise<any>;
    getProductCount(): Promise<{ count: number }>;
    getProductsPagedAndSortedFiltered(
        filter: string,
        sort: string,
        order: string,
        start: number,
        end: number
    ): Promise<Array<Product>>;
    getShoppingList(): Promise<Shoppinglist>;
    insertProductIntoShoppinglist({ id }: Product): Promise<number | null>;
    removeProductFromShoppinglist(id: string): Promise<number | null>;
}

export interface Product {
    id?: number;
    externalId: number;
    name: string;
    retailer: number;
    category: string;
    prices?: Array<Price>;
}

export interface FlatProduct {
    id: number;
    name: string;
    retailer: number;
    price: number;
    quantity: number;
    unit: string;
    normalized_price: number;
}

export type Shoppinglist = Array<Product>;

export interface Price {
    id?: number;
    price: number;
    original_price?: number;
    date: Date;
    quantity?: number;
    unit: string;
    normalized_price: number;
}

export function isPromoted(price: Price) {
    return price.original_price != null;
}

export const PODUCTS_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'retailer', 'prices'],
        properties: {
            externalId: {
                bsonType: 'number',
            },
            name: {
                bsonType: 'string',
            },
            retailer: {
                bsonType: 'number',
                enum: [0, 1, 2, 3],
            },
            category: {
                bsonType: 'string',
            },
            prices: {
                bsonType: 'array',
                minItems: 1,
                items: {
                    bsonType: 'object',
                    required: ['price', 'date', 'normalized_price'],
                    properties: {
                        price: {
                            bsonType: 'number',
                        },
                        original_price: {
                            bsonType: 'number',
                        },
                        date: {
                            bsonType: 'date',
                        },
                        quantity: {
                            bsonType: 'number',
                        },
                        unit: {
                            bsonType: 'string',
                        },
                        normalized_price: {
                            bsonType: 'number',
                        },
                    },
                },
            },
        },
    },
};

export const SHOPPINGLIST_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'array',
        items: PODUCTS_VALIDATOR.$jsonSchema,
    },
};
