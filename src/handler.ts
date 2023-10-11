import { MetadataTokenService as MetadataTokenServiceOld } from '@yandex-cloud/nodejs-sdk/dist/token-service/metadata-token-service';
import {
  Driver,
  AnonymousAuthService,
  TokenAuthService,
  MetadataAuthService,
  IDriverSettings, setupLogger,
} from 'ydb-sdk';
import {
  SimpleLogger,
  MetadataTokenService as MetadataTokenServiceNew,
  MetadataTokenService,
  TokenService,
} from 'nodejs-sdk-dev';
import { YandexCloudSimpleLogger } from 'yc-simple-logger';
import {
  IS_LOCAL,
  USE_CONTEXT_TOKEN,
  USE_OLD_TOKEN_SERVICE,
  YDB_TOKEN,
  YDB_CERT_FILE,
} from './consts';
import fs from 'fs';

export const logger: SimpleLogger.Logger = IS_LOCAL
  ? new SimpleLogger()
  : new YandexCloudSimpleLogger();

setupLogger(logger); // TODO: Current version of YDB SDK has two points where logger has to be set. Whould be nice to fix that

const tokenService: TokenService | undefined = IS_LOCAL
  ? undefined
  : new (USE_OLD_TOKEN_SERVICE
      ? MetadataTokenServiceOld
      : MetadataTokenServiceNew)({ logger, doUpdateTokenInBackground: true });

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

    await driver!.tableClient.withSession(async (session) => {
      await session.executeQuery('SELECT 1');
    });
  } catch (error) {
    logger.error(error);
  }
};

export const destroy = async () => {
  if (driver) {
    await driver.destroy();
    driver = undefined;
  }
};

const initDriver = async () => {
  if (!driver) {
    const authService = IS_LOCAL
      ? YDB_TOKEN
        ? new TokenAuthService(YDB_TOKEN) // TODO: Considere adding token auth in the cloud
        : new AnonymousAuthService()
      : new MetadataAuthService(tokenService);

    logger.debug('Init driver');

    const driverSettings: IDriverSettings = {
      connectionString: process.env.YDB_CONNECTION_STRING,
      authService,
      logger,
    };

    if (IS_LOCAL) {
      if (!fs.existsSync(YDB_CERT_FILE)) {
        throw new Error(
          `Certificate file ${YDB_CERT_FILE} doesn't exist! Please use YDB_SSL_ROOT_CERTIFICATES_FILE env variable or run Docker container https://cloud.yandex.ru/docs/ydb/getting_started/ydb_docker inside working directory`,
        );
      }
      driverSettings.sslCredentials = {
        rootCertificates: fs.readFileSync(YDB_CERT_FILE),
      };
    }

    console.info(1000, YDB_CERT_FILE, !!driverSettings.sslCredentials);
    console.info(1010, driverSettings.connectionString);
    console.info(1020, driverSettings.authService);

    driver = new Driver(driverSettings);

    console.info(2000, (driver as any).database);
    console.info(2010, (driver as any).endpoint);

    process.on('exit', () => {
      driver!.destroy();
      if (tokenService?.destroy) {
        tokenService!.destroy();
      }
    });

    const ready = await driver.ready(
      parseInt(process.env.YDB_TIMEOUT as string) || 15_000,
    );

    if (!ready) {
      return logger.error('Driver faild to initialize');
    }

    logger.debug('Driver initialized');
  }
};
