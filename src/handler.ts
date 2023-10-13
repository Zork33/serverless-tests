import {
    MetadataTokenService as MetadataTokenServiceOld
} from '@yandex-cloud/nodejs-sdk/dist/token-service/metadata-token-service';
import {
    Driver,
    AnonymousAuthService,
    TokenAuthService,
    MetadataAuthService,
    IDriverSettings,
    setupLogger,
} from 'ydb-sdk';
import {
    SimpleLogger,
    MetadataTokenService as MetadataTokenServiceNew,
    MetadataTokenService,
    TokenService,
} from './nodejs-sdk/src';
import {YandexCloudSimpleLogger} from './yandex-cloud-simple-logger/src';
import {
    IS_LOCAL,
    USE_CONTEXT_TOKEN,
    USE_OLD_TOKEN_SERVICE,
    YDB_TOKEN,
    YDB_CERT_FILE,
    APP_STARTED, IS_SERVERLESS, YDB_CONNECTION_STRING,
} from './consts';
import fs from 'fs';
import {HRInterval} from './nodejs-sdk/src/utils/hr-interval';

export const logger: SimpleLogger.Logger = IS_LOCAL
    ? new SimpleLogger()
    : new YandexCloudSimpleLogger();

setupLogger(logger); // TODO: Current version of YDB SDK has two points where logger has to be set. Whould be nice to fix that

const tokenService: TokenService | undefined = IS_LOCAL
    ? undefined
    : USE_OLD_TOKEN_SERVICE
        ? new MetadataTokenServiceOld()
        : new MetadataTokenServiceNew({logger, doUpdateTokenInBackground: !IS_SERVERLESS});

let driver: Driver | undefined;

export const handler = async (
    event: object,
    context: { [key in string]: unknown },
) => {
    try {
        if (!IS_LOCAL && !USE_OLD_TOKEN_SERVICE && USE_CONTEXT_TOKEN) {
            (tokenService as MetadataTokenServiceNew).setIamToken(
                context.token as MetadataTokenService.IamToken,
            );
        }

        await initDriver();

        // const r = await driver!.tableClient.withSession(async (session) => {
        //     const preparedQuery = await session.prepareQuery("SELECT 1");
        //     return await session.executeQuery(preparedQuery, {}, {
        //         beginTx: {onlineReadOnly: {allowInconsistentReads: false}},
        //         commitTx: true
        //     });
        // });

        await driver!.tableClient.withSession(async (session) => {
            await session.executeQuery('SELECT 1');
        });
    } catch (error) {
        logger.error(error, (error as Error).message);
    }

    return {
        statusCode: 200,
        body: `Done: ${new Date}`,
    };
};

export const destroy = async () => {
    if (driver) {
        await driver.destroy();
        driver = undefined;
    }
};

const initDriver = async () => {
    if (!driver) {
        const authService =
                YDB_TOKEN
                ? new TokenAuthService(YDB_TOKEN) // TODO: Considere adding token auth in the cloud
                : IS_LOCAL
                    ? new AnonymousAuthService()
                    : new MetadataAuthService(tokenService);

        if (authService instanceof MetadataAuthService) {
            (authService as any).MetadataTokenServiceClass = USE_OLD_TOKEN_SERVICE ? MetadataTokenServiceOld : MetadataTokenServiceNew; // HACK: Fixes YDB SDK bug
        }

        logger.debug('Init driver');

        driver = new Driver({
            connectionString: YDB_CONNECTION_STRING,
            authService,
            logger,
        });

        process.on('exit', () => {
            logger.info(
                'Finished. Worked %s',
                new HRInterval(Date.now() - APP_STARTED),
            );
            driver!.destroy();
            if (tokenService?.destroy) {
                tokenService!.destroy();
            }
        });

        const ready = await driver.ready(
          parseInt(process.env.YDB_TIMEOUT as any) || 15_000,
        );

        if (!ready) {
          return logger.error('Driver faild to initialize');
        }

        logger.debug('Driver initialized');
    }
};
