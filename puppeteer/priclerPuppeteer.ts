import {Browser, LaunchOptions, Page, Response} from "puppeteer";

const priclerPuppeteer = require('puppeteer');
require('dotenv').config();

const puppeteerConfig: LaunchOptions = {
    timeout: 120000,
    headless: process.env.HEADLESS === 'true',
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

function attachErrorHandlerToPage(page: Page) {

    page.on('requestfailed', request => {
        console.log(`url: ${request.url()}, errText: ${request.failure().errorText}, method: ${request.method()}`)
    });
    // Catch console log errors
    page.on("pageerror", err => {
        console.log(`Page error: ${err.toString()}`);
    });
    return page;
}

export async function openNewPage(): Promise<Page> {
    console.log('opening new page')
    if (browser) {
        return browser
            .then((b) => b.newPage())
            .then(attachErrorHandlerToPage);
    }
    initializeBrowser();
    return browser
        .then((b) => b.newPage())
        .then(attachErrorHandlerToPage);
}

export async function navigateToUrl(page: Page, url: string): Promise<Response | null> {
    console.log('navigating to url: ' + url);
    return page.goto(url, {waitUntil: 'load', timeout: 0}).catch(err => {
        return page.goto(url, {waitUntil: 'load', timeout: 0}).catch(err => {
            console.log('could not go to url: ', url, 'beacuse: ', err);
            return null
        })
    })
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

export function autoScroll(page: Page) {
    return page.evaluate(() => {
        return new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}