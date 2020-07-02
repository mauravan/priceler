import {ListedArticle} from "./types";
import * as fs from "fs";
import {stringArrayToString} from "./helpers";
const sqlite3 = require('sqlite3').verbose();
let db;

(function initializeDB() {
    db = new sqlite3.Database('./db/pricler.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the pricler database.');
    });
    db.run('CREATE TABLE IF NOT EXISTS products (id INT PRIMARY KEY ON CONFLICT ROLLBACK AUTOINCREMENT, name VARCHAR(255) UNIQUE ON CONFLICT ROLLBACK, price FLOAT(4, 2) )');
})()

export function closeDB() {
    if (db) {
        db.close()
    }
}




export function writeDataToCsv(fileName: string, data: Array<ListedArticle>, callback) {
    fs.writeFileSync(fileName, stringArrayToString(data), callback);
}

export function appendDataToCsv(fileName: string, data: Array<ListedArticle>, callback) {
    fs.appendFileSync(fileName, stringArrayToString(data), callback);
}