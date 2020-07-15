import {Migroscrawler} from "./migroscrawler";
import {Notimplementedcrawler} from "./notimplementedcrawler";
import {Lidlcrawler} from "./lidlcrawler";
import {Coopcrawler} from "./coopcrawler";

const migrosBaseUrl = 'https://produkte.migros.ch/sortiment/supermarkt';
const migrosPageUrl = '?page=';
const lildBaseUrl = 'https://sortiment.lidl.ch/de/alle-kategorien.html';
const lidlPageUrl = '?p=';
const aldiBaseUrl = 'https://www.aldi-suisse.ch/de/sortiment';
const coopBaseUrl = 'https://www.coop.ch/de/'

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
    [CRAWLERTYPE.COOP]: new Coopcrawler(CRAWLERTYPE.COOP, coopBaseUrl, ''),
    [CRAWLERTYPE.ALDI]: new Notimplementedcrawler(CRAWLERTYPE.ALDI),
    [CRAWLERTYPE.LIDL]: new Lidlcrawler(CRAWLERTYPE.LIDL, lildBaseUrl, lidlPageUrl),
}