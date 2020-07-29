import { Product } from "../../types/types";
import { all, get, run } from "./database";

export function initializeProductsDB() {
  return Promise.all([
    run(
      "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, external_id INTEGER NOT NULL , name VARCHAR(255) UNIQUE ON CONFLICT ROLLBACK, retailer INTEGER, category VARCHAR(255))"
    ),
    run(
      "CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE, price INTEGER NOT NULL, date DATE NOT NULL, original_price INTEGER, quantity INTEGER, unit VARCHAR(255), normalized_price INTEGER)"
    ),
  ]);
}

async function update({ name, prices: [price] }: Product): Promise<number> {
  const product = await getProductByName(name);
  try {
    await run(
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

function insert({
  name,
  retailer,
  externalId,
  category,
  prices: [price],
}: Product): Promise<number | null> {
  return run(
    "INSERT INTO products (name, external_id, retailer, category) VALUES (?, ?, ?, ?)",
    [name, externalId, retailer, category]
  ).then((id) => {
    return run(
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

export function createOrUpdateProduct(product: Product): Promise<number> {
  return insert(product).catch((err) => {
    if (err.code === "SQLITE_CONSTRAINT") {
      return update(product);
    }
    console.log("could not insert product, ", product.name, "beacuse: ", err);
  });
}

export async function getProductCount(): Promise<{ count: number }> {
  return await get("SELECT COUNT(*) as count FROM products");
}

export async function getProductsPaged(
  start: number,
  end: number
): Promise<Array<Product>> {
  return all(
    `SELECT products.name, products.retailer, p.price, p.quantity, p.unit, p.normalized_price
                FROM products
                LEFT JOIN prices p on products.id = p.product_id
                WHERE products.id > ?
                ORDER BY products.id
                LIMIT ?`,
    [start, end]
  );
}

const sortableProperties: { [key: string]: string } = {
  id: "product.id",
  name: "product.name",
  retailer: "product.retailer",
  price: "price.price",
  quantity: "price.quantity",
  unit: "price.unit",
  normalized_price: "price.normalized_price",
};

export async function getProductsPagedAndSorted(
  filter: string,
  sort: string,
  order: string,
  start: number,
  end: number
): Promise<Array<Product>> {
  if (!["ASC", "DESC", ""].includes(order.toUpperCase())) {
    return Promise.reject("only ASC or DESC allowed");
  }
  return all(
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

export async function getProductByName(name: string): Promise<Product> {
  const product = await get("SELECT * FROM products WHERE name = ?", [name]);
  if (product) {
    const prices = await all("SELECT * FROM prices where product_id = ?", [
      product.id,
    ]);
    return { ...product, prices };
  }
  return Promise.reject("Product not found");
}

export async function getProductById(id: number): Promise<Product> {
  const product = await get("SELECT * FROM products WHERE id = ?", [id]);
  if (product) {
    const prices = await all("SELECT * FROM prices where product_id = ?", [
      product.id,
    ]);
    return { ...product, prices };
  }
  return Promise.reject("Product not found");
}
