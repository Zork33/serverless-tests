// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import {Driver, TokenAuthService} from 'ydb-sdk';
import {YDB_CONNECTION_STRING, YDB_TOKEN} from "./consts";

(async function () {
    const driver = new Driver({
        connectionString: YDB_CONNECTION_STRING,
        authService: new TokenAuthService(YDB_TOKEN!),
    });

    console.info(1000, {
        connectionString: YDB_CONNECTION_STRING,
        authService: new TokenAuthService(YDB_TOKEN!),
    });

    console.info(1010, await driver.ready(3000));

    try {
        let r = await driver.tableClient.withSession(async (session) => {
            const preparedQuery = await session.prepareQuery("SELECT 1");
            return await session.executeQuery(preparedQuery, {}, {
                beginTx: {onlineReadOnly: {allowInconsistentReads: false}},
                commitTx: true
            });
        });
        console.info(1000, JSON.stringify(r, null, 2));
    } finally {
        await driver.destroy();
    }
})();
