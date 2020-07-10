import {Browser, LaunchOptions, Response} from "puppeteer";
import {Page} from "puppeteer";
const priclerPuppeteer = require('puppeteer');
require('dotenv').config();

const puppeteerConfig: LaunchOptions = {
    timeout: 120000,
    headless:  process.env.HEADLESS === 'true',
    args: ['--disable-dev-shm-usage', '--no-sandbox',]
}

let browser: Promise<Browser>;

export function initializeBrowser(): void {
    if (browser) {
        console.log('browser already initialized, open new page')
    }
    console.log('launching new browser')
    browser = priclerPuppeteer.launch(puppeteerConfig);
}

export async function openNewPage(): Promise<Page> {
    console.log('opening new page')
    if (browser) {
        return browser.then((b) => b.newPage());
    }
    initializeBrowser();
    return browser.then((b) => b.newPage());
}

export async function navigateToUrl(page: Page, url: string): Promise<Response | null> {
    console.log('navigating to url: ' + url);
    return page.goto(url)
}

export async function closePage(page: Page): Promise<void> {
    return page.close()
}

export function closeBrowser() {
        console.log('closing browser')
    if (browser) {
        browser.then(b => b.close())
    }
}