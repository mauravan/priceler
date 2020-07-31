import { env, types } from 'pricler-types';

import { MongodbDatabase } from './mongo/mongodb.database';
import { SqliteDatabase } from './sqlite/sqlite.database';

const dbMap: { [key: string]: any } = {
    [types.DBTYPE.SQLITE]: SqliteDatabase,
    [types.DBTYPE.MONGO]: MongodbDatabase,
};

export function loadDbInstance() {
    return dbMap[env.activatedDB()].instance();
}