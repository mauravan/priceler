import { Request, Response } from 'express';
import { helpers } from 'pricler-types';
import { loadDbInstance } from 'pricler-database';

const db = loadDbInstance();

async function shoppingListOr500(id: string, res: Response) {
    try {
        const shoppinglist = await db.getShoppingList(id);
        const data = `data: ${JSON.stringify(shoppinglist)}\n\n`;
        res.write(data);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

let client: Response;
export async function getShoppingListHandler(req: Request, res: Response) {
    // Mandatory headers and http status to keep connection open
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE with client
    // After client opens connection send shopinglist
    await shoppingListOr500(req.params.id, res);
    // Generate an id based on timestamp and save res
    // object of client connection on clients list
    // Later we'll iterate it and send updates to each client
    client = res;

    // When client closes connection we update the clients list
    // avoiding the disconnected one
    req.on('close', () => {
        console.log('client Connection closed');
        res.end();
    });
}

export async function postProductToShoppingListHandler({ params: { id }, body }: Request, res: Response) {
    try {
        await helpers.retryAble(() => db.insertProductIntoShoppinglist(id, body));
        res.json({}).status(200).send();
        await shoppingListOr500(id, client);
    } catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}

export async function deleteProductToShoppingListHandler({ params: { id, productId } }: Request, res: Response) {
    try {
        await db.removeProductFromShoppinglist(id, productId);
        res.json({}).status(200).send();
        await shoppingListOr500(id, client);
    } catch (e) {
        res.sendStatus(500);
        console.log(e);
    }
}
