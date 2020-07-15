import {Request, Response} from "express";
import {getProductsPaged} from "../db/database";

const express = require("express");
const app = express();

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get("/products", (req: Request, res: Response) => {
    if (req.query && req.query.limit && req.query.page) {
        const limit: number = parseInt(<string>req.query.limit);
        const page: number = parseInt(<string>req.query.page);

        return getProductsPaged(page*limit, limit).then((products) => {
            return res.json(products)
        })
    }
    return getProductsPaged(0, 100).then((products) => {
        return res.json(products)
    })
});