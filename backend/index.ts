import {
  deleteProductToShoppingListHandler,
  getShoppingListHandler,
  postProductToShoppingListHandler,
} from "./shoppinglist.api";
import { getProductsCountHandler, getProductsHandler } from "./products.api";
import { closeDB, initializeDB } from "../crawlerapp/db/database";

initializeDB().then(() => {
  const express = require("express");
  const app = express();

  process.on("SIGTERM", () => {
    if (app) {
      app.close(() => {
        closeDB();
        console.log("Closed out remaining connections.");
      });
    }
  });

  app.use(express.json());
  app.use(express.urlencoded({extended: false}));

  app.get("/shoppinglist", getShoppingListHandler);
  app.post("/shoppinglist", postProductToShoppingListHandler);
  app.delete("/shoppinglist/:id", deleteProductToShoppingListHandler);
  app.get("/products/count", getProductsCountHandler);
  app.get("/products", getProductsHandler);

  app.listen(3000, async () => {
    console.log("Server running on port 3000");
  });
});
