export interface MigrosArticle {
    id: number,
    name: string,
    meta: {
        price: number,
        original_price: number,
    },
    price_info: {
        quantity: string,
        price: string,
        original_price: string
    },
    product_tile_infos: {
        price_sub_text: string
    },
    categories: Array<{ code: string, name: string }>
}

export enum RETAILER {
    MIGROS,
    COOP,
    ALDI,
    LIDL
}

export interface Product {
    id?: number,
    externalId: number,
    name: string,
    retailer: number,
    category: string,
    prices?: Array<Price>,
}

export interface FlatProduct {
    id: number,
    name: string,
    retailer: number,
    price: number,
    quantity: string
}

export interface Price {
    id?: number
    price: number
    original_price?: number
    date: Date
    quantity?: number,
    unit: string,
    normalized_price: number
}
export function isPromoted(price: Price) {
    return price.original_price != null;
}