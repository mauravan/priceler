import {
    deleteProductToShoppingListHandler,
    getShoppingListHandler,
    postProductToShoppingListHandler,
} from './shoppinglist.api';
import { getProductsCountHandler, getProductsHandler } from './products.api';
import { loadDbInstance } from 'pricler-database';

const express = require('express');
const app = express();

process.on('SIGTERM', () => {
    if (app) {
        app.close(() => {
            loadDbInstance().close();
            console.log('Closed out remaining connections.');
        });
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/shoppinglist', getShoppingListHandler);
app.get('/shoppinglist/:id', getShoppingListHandler);
app.post('/shoppinglist/:id', postProductToShoppingListHandler);
app.delete('/shoppinglist/:id/:productId', deleteProductToShoppingListHandler);
app.get('/products/count', getProductsCountHandler);
app.get('/products', getProductsHandler);

app.listen(3000, async () => {
    console.log('Server running on port 3000');
});
