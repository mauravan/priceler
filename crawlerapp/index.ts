import {activatedCrawlers, pagesFromEnv} from "../config/env";
import {closeDB} from "../db/database";
import {crawlerMap} from "./crawlers/crawler";

(function initializer() {

    const crawlers = activatedCrawlers()
        .map(crawlerString => crawlerMap[crawlerString].crawl(pagesFromEnv()).catch((e) => console.log('error in crawler: ', crawlerString, e)));

    Promise.all(crawlers).then(() => {
        console.log('closing db')
        closeDB();
        console.log('bye')
        process.exit();
    }).catch((e) => {
        console.log('error in a crawler: ', e);
        process.exit();
    })
})()


