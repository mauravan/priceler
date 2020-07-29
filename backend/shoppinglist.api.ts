import { Request, Response } from "express";
import {
  getShoppingList,
  insertProductIntoShoppinglist,
  removeProductFromShoppinglist,
} from "../crawlerapp/db/shoppinglist.database";

async function shoppingListOr500(res: Response) {
  try {
    const shoppinglist = await getShoppingList();
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
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client
  // After client opens connection send shopinglist
  await shoppingListOr500(res);
  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  client = res;

  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on("close", () => {
    console.log("client Connection closed");
    res.end();
  });
}

export async function postProductToShoppingListHandler(
  { body }: Request,
  res: Response
) {
  try {
    await insertProductIntoShoppinglist(body);
    res.json({}).status(200).send();
    await shoppingListOr500(client);
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
}

export async function deleteProductToShoppingListHandler(
  { params: { id } }: Request,
  res: Response
) {
  try {
    await removeProductFromShoppinglist(id);
    res.json({}).status(200).send();
    await shoppingListOr500(client);
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
}
