import {CRAWLERTYPE, DBTYPE} from './types';

function getProcessEnvironment() {
  return process.env;
}

export function startingPageMigros(): number {
  const { STARTING_PAGE_MIGROS } = getProcessEnvironment();
  return parseInt(STARTING_PAGE_MIGROS);
}

export function startingPageCoop(): number {
  const { STARTING_PAGE_COOP } = getProcessEnvironment();
  return parseInt(STARTING_PAGE_COOP);
}

export function startingPageLidl(): number {
  const { STARTING_PAGE_LIDL } = getProcessEnvironment();
  return parseInt(STARTING_PAGE_LIDL);
}

export function debugMode() {
  const { DEBUG } = getProcessEnvironment();
  return DEBUG === "true";
}

export function pagesFromEnv(): number {
  const { PAGES } = getProcessEnvironment();
  return parseInt(PAGES);
}

export function migrosActivated(): boolean {
  const { CRAWLERS } = getProcessEnvironment();
  return CRAWLERS.includes(CRAWLERTYPE.MIGROS);
}

export function coopActivated(): boolean {
  const { CRAWLERS } = getProcessEnvironment();
  return CRAWLERS.includes(CRAWLERTYPE.COOP);
}

export function aldiActivated(): boolean {
  const { CRAWLERS } = getProcessEnvironment();
  return CRAWLERS.includes(CRAWLERTYPE.ALDI);
}

export function lidlActivated(): boolean {
  const { CRAWLERS } = getProcessEnvironment();
  return CRAWLERS.includes(CRAWLERTYPE.LIDL);
}

export function activatedCrawlers(): Array<CRAWLERTYPE> {
  const { CRAWLERS } = getProcessEnvironment();
  return CRAWLERS.split(",").map(
    (str) => CRAWLERTYPE[str as keyof typeof CRAWLERTYPE]
  );
}

export function activatedDB(): DBTYPE {
  const { DATABASE } = getProcessEnvironment();
  return DATABASE as DBTYPE;
}

export function runPuppeteerHeadless() {
  const { HEADLESS } = getProcessEnvironment();
  return HEADLESS === "true";
}
