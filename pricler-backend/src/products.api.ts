import { Request, Response } from 'express';
import { loadDbInstance } from 'pricler-database';
import { types } from 'pricler-types';

const db = loadDbInstance();

export function getProductsCountHandler(req: Request, res: Response) {
    return db
        .getProductCount()
        .then(({ count }: { count: number }) => res.json(count))
        .catch(console.log);
}

export function getProductsHandler({ query }: Request, res: Response) {
    console.log('getProductsHandler');
    if (query) {
        const { sort, order, page, limit, filter } = query;
        if (sort && order && page && limit) {
            const limitAsNumber = parseInt(<string>limit);
            const pageAsNumber = parseInt(<string>page);

            return db
                .getProductsPagedAndSortedFiltered(
                    filter as string,
                    sort as string,
                    order as string,
                    pageAsNumber * limitAsNumber,
                    limitAsNumber
                )
                .then((products: Array<types.FlatProduct>) => {
                    return res.json(products);
                })
                .catch((err: any) => {
                    return res.status(403).json(err);
                });
        }
    }
    return db
        .getProductsPagedAndSortedFiltered('', 'name', 'DESC', 0, 100)
        .then((products) => {
            return res.json(products);
        })
        .catch(console.log);
}
