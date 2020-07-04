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
    }
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
    prices?: Array<Price>,
}

export interface Price {
    id?: number
    price: number
    original_price?: number
    date: Date
    quantity?: string
}
export function isPromoted(price: Price) {
    return price.original_price != null;
}