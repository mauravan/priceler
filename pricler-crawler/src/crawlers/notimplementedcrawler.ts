import { Crawler } from './crawler';
import { types } from 'pricler-types';

export class Notimplementedcrawler implements Crawler {
    constructor(private type: types.CRAWLERTYPE) {}

    crawl(amountOfPagesToCrawl: number): Promise<void> {
        console.log('crawler not implementet ', this.type);
        return Promise.resolve(undefined);
    }
}
