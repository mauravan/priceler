import {Browser, LaunchOptions, Page} from "puppeteer";

const puppeteer = require('puppeteer');
const fs = require('fs');

const migros = 'https://produkte.migros.ch/sortiment/supermarkt';
const migrosNextButtonSelector = 'button[data-testid="msrc-articles--pagination-link-next"]';
const migrosArticleSelector = 'article[data-testid="msrc-articles--article"]';
const migrosFileName = 'migrosData.csv';
let pageCount = 0;

interface ListedArticle {
    price: number,
    name: string,
    isPromoted: boolean,
    oldPrice?: number
}

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

async function getDataForPage(page: Page, selector: string): Promise<Array<any>> {
    console.log('loading data for page: ', pageCount++);
    await page.waitFor('article', {timeout: 5000})
    return page.evaluate((selector: string) => {
        return Array.from(document.querySelectorAll<HTMLElement>(selector), article => article.innerText);
    }, selector);
}

async function hasMorePages(page: Page, selector: string) {
    try {
        await page.waitForSelector(selector, {timeout: 5000})
        const isDisabled = await page.$eval(selector, (button: HTMLButtonElement) => {
            return button.disabled;
        });
        return !isDisabled;
    } catch (error) {
        console.log("No more pages found")
    }
    return false
}

async function nextPage(page: Page, selector: string) {
    await page.$eval(selector, (el: HTMLElement) => el.click());
}

function cleanPrice(price: string): number {
    const splitPrice = price.split('.');
    const afterComma = parseInt(splitPrice[1]);

    if (isNaN(afterComma)) {
        return parseFloat(splitPrice[0].replace('/(?!\.)\D/g', '') + '.00')
    }
    return parseFloat(`${splitPrice[0]}.${afterComma.toString().padStart(2, '0')}`)

}

function parseMigrosArticle(article: string): ListedArticle {
    const splitupArticleStrings = article.split('\n');
    const price = cleanPrice(splitupArticleStrings[0]);
    const isPromoted = splitupArticleStrings[1].includes('statt');
    const name = isPromoted ? splitupArticleStrings[2] : splitupArticleStrings[1];
    const oldPrice = isPromoted ? cleanPrice(splitupArticleStrings[1].split(' ')[1]) : null;
    if (isPromoted) {
        return {
            price,
            isPromoted,
            name,
            oldPrice
        }
    }
    return {
        price,
        name,
        isPromoted,
    }
}

function listedArticleToLine({name, price, oldPrice}: ListedArticle) {
    return `${name}\t${price}\t${oldPrice}\n`
}

function stringArrayToString(listedArticles: Array<ListedArticle>) {
    return listedArticles.map(listedArticleToLine).join('');
}

function writeMigrosDataToCsv(fileName: string, data: Array<ListedArticle>, callback) {
    fs.writeFileSync(fileName, stringArrayToString(data), callback);
}

function writeToFileCallback(err) {
    if (err) {
        console.error('could not write data ', err);
    }
    console.log('wrote Data to migrosData.csv');
}

function appendMigrosDataToCsv(fileName: string, data: Array<ListedArticle>, callback) {
    fs.appendFileSync(fileName, stringArrayToString(data), callback);
}

async function combineDataFromAllPagesWritingInBetweenPages(page: Page) {
    writeMigrosDataToCsv(migrosFileName, [], writeToFileCallback)

    while (await hasMorePages(page, migrosNextButtonSelector)) {
        appendMigrosDataToCsv(migrosFileName, (await getDataForPage(page, migrosArticleSelector)).map(parseMigrosArticle), writeToFileCallback);
        await nextPage(page, migrosNextButtonSelector);
    }
    appendMigrosDataToCsv(migrosFileName, (await getDataForPage(page, migrosArticleSelector)).map(parseMigrosArticle), writeToFileCallback);
}

(async function doGiveMeTheArticles() {
    const browser = await initializeBrowser(puppeteerConfig);
    const page = await initializePage(browser, migros);
    await combineDataFromAllPagesWritingInBetweenPages(page);

    console.log('done, closing browser')
    await browser.close();
}())
