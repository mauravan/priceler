import {activatedCrawlers, pagesFromEnv} from "../config/env";
import {crawlerMap} from "./crawlers/crawler";
import {closeDB, initializeDB} from "./db/database";

(async function initializer() {
    await initializeDB()

    const crawlers = activatedCrawlers()
        .map(crawlerString => crawlerMap[crawlerString].crawl(pagesFromEnv()).catch((e) => console.log('error in crawler: ', crawlerString, e)));

    try {
        await Promise.all(crawlers);
    } catch(err) {
        console.log('error in a crawler: ', err);
    } finally {
        console.log('closing db')
        closeDB();
        console.log('bye')
        process.exit();
    }
})()


