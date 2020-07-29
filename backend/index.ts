import { Request, Response } from "express";
import {
  getProductCount,
  getProductsPaged,
  getProductsPagedAndSorted,
} from "../crawlerapp/db/database";

const express = require("express");
const app = express();

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.get("/products/count", (req, res) => {
  return getProductCount().then(({ count }) => res.json(count));
});

app.get("/products", ({ query }: Request, res: Response) => {
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
  return getProductsPaged(0, 100).then((products) => {
    return res.json(products);
  });
});
