export enum STOPWATCH_FORMAT {
  MILLIS = 1,
  SECS = 1000,
  MINS = 1000 * 60,
  HOURS = 1000 * 60 * 60,
}

export async function retryAble<T>(
  func: () => Promise<T>,
  times: number = 3,
  waiting = 1000
): Promise<T | null> {
  try {
    return func();
  } catch (e) {
    console.log("could not execute request will retry: ", times, " times");
    console.error(e);
    if (times > 0) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(retryAble(func, times - 1));
        }, waiting);
      });
    }
    console.log("could not execute request giving up");
    return null;
  }
}

export function withoutLeadingAndTrailingWhitespace(text: string): string {
  return text.trim();
}

export function withoutHTMLTags(text?: string) {
  return text ? text.replace(/<[^>]*>/g, "") : "";
}

export function onlyNumbersParsingToInt(text: string): number {
  return parseInt(onlyNumbers(text), 10);
}

export function onlyNumbers(text: string): string {
  return text.replace(/\D/g, "");
}

export function containsNumber(str: string) {
  return /\d/.test(str)
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
