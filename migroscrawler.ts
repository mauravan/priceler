import {ListedArticle} from "./types";
import {cleanPrice} from "./helpers";
import {Page} from "puppeteer";
import {appendDataToCsv, writeDataToCsv} from "./database";

const migrosNextButtonSelector = 'button[data-testid="msrc-articles--pagination-link-next"]';
const migrosArticleSelector = 'article[data-testid="msrc-articles--article"]';
const migrosFileName = 'migrosData.csv';
let pageCount = 0;

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


function writeToFileCallback(err) {
    if (err) {
        console.error('could not write data ', err);
    }
    console.log('wrote Data to migrosData.csv');
}


export async function combineDataFromAllPagesWritingInBetweenPages(page: Page) {
    writeDataToCsv(migrosFileName, [], writeToFileCallback)

    while (await hasMorePages(page, migrosNextButtonSelector)) {
        appendDataToCsv(migrosFileName, (await getDataForPage(page, migrosArticleSelector)).map(parseMigrosArticle), writeToFileCallback);
        await nextPage(page, migrosNextButtonSelector);
    }
    appendDataToCsv(migrosFileName, (await getDataForPage(page, migrosArticleSelector)).map(parseMigrosArticle), writeToFileCallback);
}