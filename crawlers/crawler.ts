import {Migroscrawler} from "./migroscrawler";
import {Notimplementedcrawler} from "./notimplementedcrawler";
import {Lidlcrawler} from "./lidlcrawler";

const migrosBaseUrl = 'https://produkte.migros.ch/sortiment/supermarkt';
const migrosPageUrl = '?page=';
const lildBaseUrl = 'https://sortiment.lidl.ch/de/alle-kategorien.html';
const lidlPageUrl = '?p=';
const aldiBaseUrl = 'https://www.aldi-suisse.ch/de/sortiment';

export interface Crawler {
    crawl: (amountOfPages: number) => Promise<void>;
}

export enum CRAWLERTYPE {
    MIGROS = 'MIGROS',
    COOP = 'COOP',
    ALDI = 'ALDI',
    LIDL = 'LIDL'
}

export const crawlerMap = {
    [CRAWLERTYPE.MIGROS]: new Migroscrawler(CRAWLERTYPE.MIGROS, migrosBaseUrl, migrosPageUrl),
    [CRAWLERTYPE.COOP]: new Notimplementedcrawler(CRAWLERTYPE.COOP),
    [CRAWLERTYPE.ALDI]: new Notimplementedcrawler(CRAWLERTYPE.ALDI),
    [CRAWLERTYPE.LIDL]: new Lidlcrawler(CRAWLERTYPE.LIDL, lildBaseUrl, lidlPageUrl),
}