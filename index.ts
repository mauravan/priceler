import {activatedCrawlers, pagesFromEnv} from "./config/env";
import {closeDB} from "./db/database";
import {crawlerMap} from "./crawlers/crawler";

(function initializer() {
    const crawlers: Array<Promise<void>> = [];
    
    activatedCrawlers().forEach(crawler => {
        crawlers.push(crawlerMap[crawler].crawl(pagesFromEnv()));
    })
    
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


