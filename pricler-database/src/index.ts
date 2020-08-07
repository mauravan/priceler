import { types } from 'pricler-types';

import { MongodbDatabase } from './mongo/mongodb.database';

const dbMap: { [key: string]: any } = {
    [types.DBTYPE.MONGO]: MongodbDatabase,
};

export function loadDbInstance() {
    return MongodbDatabase.instance();
}
