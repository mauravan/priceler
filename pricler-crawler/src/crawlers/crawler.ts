import { Migroscrawler } from './migroscrawler';
import { Notimplementedcrawler } from './notimplementedcrawler';
import { Lidlcrawler } from './lidlcrawler';
import { Coopcrawler } from './coopcrawler';
import { types } from 'pricler-types';
import { loadDbInstance } from 'pricler-database';

const migrosBaseUrl = 'https://produkte.migros.ch/sortiment/supermarkt';
const migrosPageUrl = '?page=';
const lildBaseUrl = 'https://sortiment.lidl.ch/de/alle-kategorien.html';
const lidlPageUrl = '?p=';
const aldiBaseUrl = 'https://www.aldi-suisse.ch/de/sortiment';
const coopBaseUrl = 'https://www.coop.ch/de/lebensmittel/c/supermarket';

export interface Crawler {
    crawl(amountOfPages: number): Promise<void>;
}

export const crawlerMap: { [key: string]: Crawler } = {
    [types.CRAWLERTYPE.MIGROS]: new Migroscrawler(
        loadDbInstance(),
        types.CRAWLERTYPE.MIGROS,
        migrosBaseUrl,
        migrosPageUrl
    ),
    [types.CRAWLERTYPE.COOP]: new Coopcrawler(loadDbInstance(), types.CRAWLERTYPE.COOP, coopBaseUrl, ''),
    [types.CRAWLERTYPE.ALDI]: new Notimplementedcrawler(types.CRAWLERTYPE.ALDI),
    [types.CRAWLERTYPE.LIDL]: new Lidlcrawler(loadDbInstance(), types.CRAWLERTYPE.LIDL, lildBaseUrl, lidlPageUrl),
};
