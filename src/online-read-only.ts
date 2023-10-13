import {Driver, TokenAuthService} from 'ydb-sdk';

(async function () {
    const driver = new Driver({
        connectionString: process.env.YDB_CONNECTION_STRING,
        authService: new TokenAuthService(process.env.YDB_TOKEN as string),
    });

    console.info(1000, {
        connectionString: process.env.YDB_CONNECTION_STRING,
        authService: new TokenAuthService(process.env.YDB_TOKEN as string),
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
