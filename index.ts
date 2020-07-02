import {Browser, LaunchOptions, Page} from "puppeteer";
import {combineDataFromAllPagesWritingInBetweenPages} from "./migroscrawler";
import {closeDB} from "./database";
const puppeteer = require('puppeteer');

const migros = 'https://produkte.migros.ch/sortiment/supermarkt';

const puppeteerConfig: LaunchOptions = {
    timeout: 120000,
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox',]
}

function initializeBrowser(config: LaunchOptions): Promise<Browser> {
    console.log('launching browser')
    return puppeteer.launch(config);
}

async function initializePage(browser: Browser, url: string): Promise<Page> {
    console.log('opening new page')
    const page = await browser.newPage();
    console.log('navigation to url: ', url)
    await page.goto(url);
    return page;
}


(async function doGiveMeTheArticles() {
    const browser = await initializeBrowser(puppeteerConfig);
    const page = await initializePage(browser, migros);
    await combineDataFromAllPagesWritingInBetweenPages(page);

    console.log('done, closing browser')
    await browser.close();
    closeDB();
}())
