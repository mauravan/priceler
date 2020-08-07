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
    getShoppingList(id: string): Promise<Shoppinglist>;
    insertProductIntoShoppinglist(shoppingListId: string, product: Product): Promise<any>;
    removeProductFromShoppinglist(shoppingList: string, product: string): Promise<any>;
}

export interface Product {
    id?: number;
    _id?: string;
    externalId: number;
    name: string;
    retailer: number;
    category: string;
    prices?: Array<Price>;
}

export interface FlatProduct {
    id?: number;
    _id?: string;
    externalId: number;
    name: string;
    retailer: number;
    category: string;
    price: number;
    original_price?: number;
    date: Date;
    quantity?: number;
    unit: string;
    normalized_price: number;
}

export interface Shoppinglist {
    _id?: string;
    products: Array<Product>;
}

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

export const PRICES_VALIDATOR = {
    $jsonSchema: {
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
            product_id: {
                bsonType: 'objectId',
            },
        },
    },
};

export const PODUCTS_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'retailer'],
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
        },
    },
};

export const SHOPPINGLIST_VALIDATOR = {
    $jsonSchema: {
        bsonType: 'object',
        properties: {
            products: {
                bsonType: 'array',
                items: PODUCTS_VALIDATOR.$jsonSchema,
            },
        },
    },
};
