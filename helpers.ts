export function pagesFromEnv(): number {
    const args = process.argv.slice(2);
    if(args[0]) {
        return parseInt(args[0])
    }
    return 99999;
}