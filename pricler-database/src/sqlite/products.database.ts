import { types } from "pricler-types";
import { all, get, run } from "./functions";
import { Database } from "sqlite3";

export function initializeProductsDB(database: Database) {
  return Promise.all([
    run(
      database,
      "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, external_id INTEGER NOT NULL , name VARCHAR(255) UNIQUE ON CONFLICT ROLLBACK, retailer INTEGER, category VARCHAR(255))"
    ),
    run(
      database,
      "CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE, price INTEGER NOT NULL, date DATE NOT NULL, original_price INTEGER, quantity INTEGER, unit VARCHAR(10), normalized_price INTEGER)"
    ),
  ]);
}

async function update(
  database: Database,
  { name, category, prices: [price] }: types.Product
): Promise<number> {
  const product = await getProductByName(database, name);
  try {
    await run(database, "UPDATE products SET category = ? WHERE id = ?", [
      category,
      product.id,
    ]);
    await run(
      database,
      "INSERT INTO prices (product_id, price, date, original_price, quantity, unit, normalized_price) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        product.id,
        price.price,
        new Date(),
        price.original_price,
        price.quantity,
        price.unit,
        price.normalized_price,
      ]
    );
  } catch (e) {
    console.log("could not update product: ", name, "beacuse: ", e);
  }
  return product.id;
}

function insert(
  database: Database,
  { name, retailer, externalId, category, prices: [price] }: types.Product
): Promise<number | null> {
  return run(
    database,
    "INSERT INTO products (name, external_id, retailer, category) VALUES (?, ?, ?, ?)",
    [name, externalId, retailer, category]
  ).then((id) => {
    return run(
      database,
      "INSERT INTO prices (product_id, price, date, original_price, quantity, unit, normalized_price) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        price.price,
        new Date(),
        price.original_price,
        price.quantity,
        price.unit,
        price.normalized_price,
      ]
    ).then(() => id);
  });
}

export function createOrUpdateProduct(
  database: Database,
  product: types.Product
): Promise<number> {
  return insert(database, product).catch((err) => {
    if (err.code === "SQLITE_CONSTRAINT") {
      return update(database, product);
    }
    console.log("could not insert product, ", product.name, "beacuse: ", err);
  });
}

export async function getProductCount(
  database: Database
): Promise<{ count: number }> {
  return await get(database, "SELECT COUNT(*) as count FROM products");
}

const sortableProperties: { [key: string]: string } = {
  name: "product.name",
  retailer: "product.retailer",
  price: "price.price",
  quantity: "price.quantity",
  unit: "price.unit",
  normalized_price: "price.normalized_price",
};

export async function getProductsPagedAndSorted(
  database: Database,
  filter: string,
  sort: string,
  order: string,
  start: number,
  end: number
): Promise<Array<types.Product>> {
  console.log("getProductsPagedAndSorted");
  if (!["ASC", "DESC", ""].includes(order.toUpperCase())) {
    return Promise.reject("only ASC or DESC allowed");
  }
  return all(
    database,
    `SELECT product.id, product.name, product.retailer, price.price, price.quantity, price.unit, price.normalized_price
                FROM products AS product
                LEFT JOIN prices AS price ON price.id = 
                       (
                           SELECT pr.id 
                           FROM prices pr 
                           WHERE pr.product_id = product.id 
                           ORDER BY pr.date DESC 
                           LIMIT 1
                        )
                WHERE product.name LIKE $filter
                ORDER BY ${sortableProperties[sort]} ${order}
                LIMIT $start, $end;`,
    { $start: start, $end: end, $filter: `%${filter}%` }
  );
}

export async function getProductByName(
  database: Database,
  name: string
): Promise<types.Product> {
  const product = await get(database, "SELECT * FROM products WHERE name = ?", [
    name,
  ]);
  if (product) {
    const prices = await all(
      database,
      "SELECT * FROM prices where product_id = ?",
      [product.id]
    );
    return { ...product, prices };
  }
  return Promise.reject("Product not found");
}
