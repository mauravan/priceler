import { Database } from "sqlite3";
import { debugMode } from "../../config/env";
import { initializeProductsDB } from "./products.database";
import { initializeShoppinglistDB } from "./shoppinglist.database";

const sqlite3 = require("sqlite3");
const DATABASE_PATH = "./crawlerapp/db/pricler.db";
let db: Database;

export function run(sql: string, params: any[] = []): Promise<number> {
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

export function get(sql: string, params: any[] = []): Promise<any> {
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

export function all(sql: string, params: any[] | {} = []): Promise<any> {
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

export function closeDB() {
  if (db) {
    db.close();
  }
}

export async function initializeDB() {
  db = new sqlite3.Database(
      DATABASE_PATH,
      sqlite3.OPEN_READWRITE,
      (err: Error | null) => {
        if (err) {
          console.error(err);
          console.error("exiting");
          process.exit();
        }
        if (debugMode()) {
          console.log("Connected to the pricler database.");
        }
      }
  );
  if (debugMode()) {
    console.log(process.cwd());
    db.on("trace", console.log);
  }

  await initializeProductsDB();
  await initializeShoppinglistDB();
}