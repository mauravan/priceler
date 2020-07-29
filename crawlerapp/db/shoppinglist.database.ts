import { all, run } from "./database";
import { Product, Shoppinglist } from "../../types/types";

export function initializeShoppinglistDB() {
  return Promise.all([
    run(
      "CREATE TABLE IF NOT EXISTS shoppinglist (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE)"
    ),
  ]);
}

export function getShoppingList(): Promise<Shoppinglist> {
  return all(
    "SELECT p.* FROM shoppinglist s LEFT JOIN products p ON s.product_id = p.id"
  );
}

export function insertProductIntoShoppinglist({
  id,
}: Product): Promise<number | null> {
  return run("INSERT INTO shoppinglist (product_id) VALUES (?)", [id]);
}

export function removeProductFromShoppinglist(
  id: string
): Promise<number | null> {
  return run("DELETE FROM shoppinglist WHERE product_id = ?", [id]);
}