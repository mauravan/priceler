import { Browser, LaunchOptions, Page, Response } from 'puppeteer';
import { helpers } from 'pricler-types';

const priclerPuppeteer = require('puppeteer');
require('dotenv').config();

const puppeteerConfig: LaunchOptions = {
    timeout: 120000,
    headless: process.env.HEADLESS === 'true',
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
};

export function initializeBrowser(): Promise<Browser> {
    return priclerPuppeteer.launch(puppeteerConfig);
}

function attachErrorHandlerToPage(page: Page) {
    page.on('requestfailed', (request) => {
        console.log(`url: ${request.url()}, errText: ${request.failure().errorText}, method: ${request.method()}`);
    });
    // Catch console log errors
    page.on('pageerror', (err) => {
        console.log(`Page error: ${err.toString()}`);
    });
    return page;
}

export async function openNewPage(browser: Browser): Promise<Page> {
    if (browser) {
        return browser.newPage().then(attachErrorHandlerToPage);
    }
}

function reopenBrowserAndPage(browser: Browser): Promise<{ page: Page; browser: Browser }> {
    return closeBrowser(browser).then(() => {
        return initializeBrowser().then((newBrowser) => {
            return openNewPage(newBrowser).then((page) => ({
                page,
                browser: newBrowser,
            }));
        });
    });
}

export async function navigateToUrl(page: Page, url: string, browser: Browser): Promise<Response | null> {
    console.log('navigating to url: ' + url);
    return helpers.retryAble(() =>
        page.goto(url, { waitUntil: 'load', timeout: 0 }).catch((err) => {
            console.log('error in navigation, reopening page: ', err);
            return reopenBrowserAndPage(browser).then((newPageAndBrowser) => {
                return navigateToUrl(newPageAndBrowser.page, url, newPageAndBrowser.browser);
            });
        })
    );
}

export async function closePage(page: Page): Promise<void> {
    return page.close();
}

export function closeBrowser(browser: Browser): Promise<void> {
    console.log('closing browser');
    if (browser) {
        return browser.close();
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
