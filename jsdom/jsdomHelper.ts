const jsdom = require("jsdom");
const {JSDOM} = jsdom;

export async function goToPageReturningDom(url: string): Promise<Document> {
    console.log('navigating to url: ', url)
    const virtualConsole = new jsdom.VirtualConsole(); // removing console errors

    try {
        let document = await JSDOM.fromURL(url, {
            runScripts: "dangerously",
            resources: "usable",
            pretendToBeVisual: true,
            virtualConsole,
        });
        return document.window.document;
    } catch (e) {
        console.log('could not open url: ', url, ' will retry')
        let document = await JSDOM.fromURL(url, {
            runScripts: "dangerously",
            resources: "usable",
            pretendToBeVisual: true,
            virtualConsole,
        });
        return document.window.document;
    }

}