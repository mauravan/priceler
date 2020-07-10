import {Crawler, CRAWLERTYPE} from "./crawler";

export class Notimplementedcrawler implements Crawler{
    constructor(private type: CRAWLERTYPE) {}

    crawl(amountOfPagesToCrawl: number): Promise<void> {
        console.log('crawler not implementet ', this.type)
        return Promise.resolve(undefined);
    }
}