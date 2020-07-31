export enum STOPWATCH_FORMAT {
    MILLIS = 1,
    SECS = 1000,
    MINS = 1000 * 60,
    HOURS = 1000 * 60 * 60,
}

export async function retryAble<T>(
    fn: () => Promise<T>,
    retriesLeft: number = 3,
    interval: number = 1000,
    exponential: boolean = false
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retriesLeft) {
            await new Promise(r => setTimeout(r, interval));
            return retryAble(
                fn,
                retriesLeft - 1,
                exponential ? interval * 2 : interval,
                exponential
            );
        } else throw new Error(`Max retries reached for function ${fn.name}`);
    }
}


export function withoutLeadingAndTrailingWhitespace(text: string): string {
    return text.trim();
}

export function withoutHTMLTags(text?: string) {
    return text ? text.replace(/<[^>]*>/g, '') : '';
}

export function onlyNumbersParsingToInt(text: string): number {
    return parseInt(onlyNumbers(text), 10);
}

export function onlyNumbers(text: string): string {
    return text.replace(/\D/g, '');
}

export function isOnlyWhitespace(text: string): boolean {
    return !text.replace(/\s/g, '').length;
}

export function containsNumber(str: string) {
    return /\d/.test(str);
}

export function normalizedPrice(price: number, quantity: number) {
    if (price && quantity) {
        return price / quantity;
    }
    return 0;
}

export class Stopwatch {
    private startTime: Date;

    constructor() {
        this.startTime = new Date();
    }

    startTimer() {
        this.startTime = new Date();
    }

    stopTimer(format: STOPWATCH_FORMAT = STOPWATCH_FORMAT.MILLIS): number {
        return (new Date().getTime() - this.startTime.getTime()) / format;
    }
}
