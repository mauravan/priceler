import {Browser, LaunchOptions, Page} from "puppeteer";
import {getMaxPages, mapMigrosArticleToProduct, migrosLastButtonSelector} from "./migroscrawler";
import {closeDB, createOrUpdateProduct} from "./database";
import {pagesFromEnv} from "./helpers";
import {MigrosArticle} from "./types";
const puppeteer = require('puppeteer');

const migrosBaseUrl = 'https://produkte.migros.ch/sortiment/supermarkt';
const migrosPageUrl = '?page=';

const puppeteerConfig: LaunchOptions = {
    timeout: 120000,
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox',]
}

function initializeBrowser(config: LaunchOptions): Promise<Browser> {
    console.log('launching browser')
    return puppeteer.launch(config);
}

async function loadDataFromNetwork(browser: Browser, url: string): Promise<Array<MigrosArticle>> {
    console.log('navigation to url: ', url)
    const page = await browser.newPage();

    return new Promise((async resolve => {
        page.on('response', async response => {
            if (response.url().includes("web-api.migros.ch/widgets/product_fragments_json")) {
                const data = <Array<MigrosArticle>>await response.json();
                resolve(data)
                await page.close()
            }
        });
        await page.goto(url);
    }));
}

(async function doGiveMeTheArticles() {
    const browser = await initializeBrowser(puppeteerConfig);

    const maxPages = parseInt(await getMaxPages(browser, migrosBaseUrl, migrosLastButtonSelector));
    const maxPagesEnv = pagesFromEnv();

    for (let i = 1; i <= maxPages && i <= maxPagesEnv; i++) {
        // Fills up combinedMigrosData array
        const migrosArticles = await loadDataFromNetwork(browser, `${migrosBaseUrl}${migrosPageUrl}${i}`);
        const productIds = await Promise.all(migrosArticles.map(mapMigrosArticleToProduct).map(createOrUpdateProduct));
        console.log(productIds)
    }

    console.log('done, closing browser')
    await browser.close();
    console.log('closing db')
    closeDB();
    console.log('bye')
}())
