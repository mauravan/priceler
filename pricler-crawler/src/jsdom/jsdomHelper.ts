import { helpers } from 'pricler-types';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

export async function goToPageReturningDom(url: string): Promise<Document> {
    console.log('navigating to url: ', url);
    const virtualConsole = new jsdom.VirtualConsole(); // removing console errors

    let document = await helpers.retryAble<typeof JSDOM>(
        () =>
            JSDOM.fromURL(url, {
                runScripts: 'dangerously',
                resources: 'usable',
                pretendToBeVisual: true,
                virtualConsole,
            }),
        4
    );
    return document.window.document;
}
