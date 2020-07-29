import { Database } from "sqlite3";
import { Product } from "../../types/types";

const sqlite3 = require("sqlite3").verbose();
const DATABASE_PATH = "./crawlerapp/db/pricler.db";
let db: Database;

function run(sql: string, params: any[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

function get(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, result) => {
      if (err) {
        console.log("Error running sql: " + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function all(sql: string, params: any[] | {} = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.log("Error running sql: " + sql);
        console.log(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

(async function initializeDB() {
  console.log(process.cwd());
  db = new sqlite3.Database(
    DATABASE_PATH,
    sqlite3.OPEN_READWRITE,
    (err: Error | null) => {
      if (err) {
        console.error(err);
        console.error("exiting");
        process.exit();
      }
      console.log("Connected to the pricler database.");
    }
  );
  await run(
    "CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, external_id INTEGER NOT NULL , name VARCHAR(255) UNIQUE ON CONFLICT ROLLBACK, retailer INTEGER, category VARCHAR(255))"
  );
  await run(
    "CREATE TABLE IF NOT EXISTS prices (id INTEGER PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE, price INTEGER NOT NULL, date DATE NOT NULL, original_price INTEGER, quantity INTEGER, unit VARCHAR(255), normalized_price INTEGER)"
  );

  db.on("trace", console.log);
})();

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
    console.log("could not update product, ", this.args[0], "beacuse: ", e);
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
  )
    .then((id) => {
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
    })
    .catch((e) => {
      console.log("could not insert product, ", this.args[0], "beacuse: ", e);
      return null;
    });
}

export function createOrUpdateProduct(product: Product): Promise<number> {
  return insert(product).catch((err) => {
    if (err.code === "SQLITE_CONSTRAINT") {
      return update(product);
    }
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
    `SELECT products.name, products.retailer, p.price, p.quantity
                FROM products
                LEFT JOIN prices p on products.id = p.product_id
                WHERE products.id > ?
                ORDER BY products.id
                LIMIT ?, ?;`,
    [start, end]
  );
}

const sortableProperties: { [key: string]: string } = {
  id: "products.id",
  name: "products.name",
  retailer: "products.retailer",
  price: "p.price",
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
    `SELECT products.id, products.name, products.retailer, p.price, p.quantity
                FROM products
                LEFT JOIN prices p on products.id = p.product_id
                WHERE products.name LIKE $filter
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

export function closeDB() {
  if (db) {
    db.close();
  }
}
