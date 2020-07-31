import { helpers } from 'pricler-types';
import { Database } from 'sqlite3';

export function run(database: Database, sql: string, params: any[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
        database.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

export function get(database: Database, sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
        database.get(sql, params, (err, result) => {
            if (err) {
                console.log('Error running sql: ' + sql);
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export function all(database: Database, sql: string, params: any[] | {} = []): Promise<any> {
    const stopwatch = new helpers.Stopwatch();
    stopwatch.startTimer();
    return new Promise((resolve, reject) => {
        console.log('calling DB');
        database.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Error running sql: ' + sql);
                console.log(err);
                reject(err);
            } else {
                console.log(stopwatch.stopTimer(helpers.STOPWATCH_FORMAT.SECS));
                resolve(rows);
            }
        });
    });
}
