export enum STOPWATCH_FORMAT {
    MILLIS = 1,
    SECS = 1000,
    MINS = 1000 * 60,
    HOURS= 1000 * 60 * 60
}

export function withoutLeadngAndTrailingWhitespace(text: string): string {
    return text.trim();
}

export function withoutHTMLTags(text?: string) {
    return text ? text.replace(/<[^>]*>/g, '') : '';
}

export function onlyNumbersParsingToInt(text: string): number {
    return parseInt(onlyNumbers(text), 10)
}

export function onlyNumbers(text: string): string {
    return text.replace(/\D/g, '')
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