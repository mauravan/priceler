import {Crawler, CRAWLERTYPE} from "./crawler";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

export class Lidlcrawler implements Crawler {
    constructor(private type: CRAWLERTYPE, private baseUrl: string, private pageUrl: string) {}

    async crawl(amountOfPages: number): Promise<void> {
        // const window = new JSDOM(``, {
        //     url: this.baseUrl,
        //     runScripts: "dangerously",
        //     pretendToBeVisual: true
        // }).window;
        //
        // console.log(window.body.querySelectorAll());

        console.log('not yet implemented')
    }
}
