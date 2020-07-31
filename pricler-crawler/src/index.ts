import { env } from 'pricler-types';
import { crawlerMap } from './crawlers/crawler';
import { loadDbInstance } from 'pricler-database';

(async function initializer() {
    const crawlers = env
        .activatedCrawlers()
        .map((crawlerString) =>
            crawlerMap[crawlerString]
                .crawl(env.pagesFromEnv())
                .catch((e) => console.log('error in crawler: ', crawlerString, e))
        );

    try {
        await Promise.all(crawlers);
    } catch (err) {
        console.log('error in a crawler: ', err);
    } finally {
        loadDbInstance().close();
        console.log('bye');
        process.exit();
    }
})();
