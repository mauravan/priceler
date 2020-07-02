import {ListedArticle} from "./types";

export function cleanPrice(price: string): number {
    const splitPrice = price.split('.');
    const afterComma = parseInt(splitPrice[1]);

    if (isNaN(afterComma)) {
        return parseFloat(splitPrice[0].replace('/(?!\.)\D/g', '') + '.00')
    }
    return parseFloat(`${splitPrice[0]}.${afterComma.toString().padStart(2, '0')}`)
}

export function listedArticleToLine({name, price, oldPrice}: ListedArticle) {
    return `${name}\t${price}\t${oldPrice}\n`
}

export function stringArrayToString(listedArticles: Array<ListedArticle>) {
    return listedArticles.map(listedArticleToLine).join('');
}
