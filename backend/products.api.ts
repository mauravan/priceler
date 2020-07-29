import {
  getProductCount,
  getProductsPaged,
  getProductsPagedAndSorted,
} from "../crawlerapp/db/products.database";
import { Request, Response } from "express";

export function getProductsCountHandler(req: Request, res: Response) {
  return getProductCount()
    .then(({ count }) => res.json(count))
    .catch(console.log);
}

export function getProductsHandler({ query }: Request, res: Response) {
  if (query) {
    const { sort, order, page, limit, filter } = query;
    if (sort && order && page && limit) {
      const limitAsNumber = parseInt(<string>limit);
      const pageAsNumber = parseInt(<string>page);

      return getProductsPagedAndSorted(
        filter as string,
        sort as string,
        order as string,
        pageAsNumber * limitAsNumber,
        limitAsNumber
      )
        .then((products) => {
          return res.json(products);
        })
        .catch((err) => {
          return res.status(403).json(err);
        });
    }
  }
  return getProductsPaged(0, 100)
    .then((products) => {
      return res.json(products);
    })
    .catch(console.log);
}
