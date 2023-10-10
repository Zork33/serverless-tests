import { MetadataTokenService as MetadataTokenServiceOld } from '@yandex-cloud/nodejs-sdk/dist/token-service/metadata-token-service';
import {
  Driver,
  AnonymousAuthService,
  TokenAuthService,
  MetadataAuthService,
} from 'ydb-sdk';
import {
  SimpleLogger,
  MetadataTokenService as MetadataTokenServiceNew,
  MetadataTokenService,
} from 'nodejs-sdk-dev';
import { YandexCloudSimpleLogger } from 'yc-simple-logger';
import {
  IS_LOCAL,
  USE_CONTEXT_TOKEN,
  USE_OLD_TOKEN_SERVICE,
  YDB_TOKEN,
} from './consts';

export const logger: SimpleLogger.Logger = IS_LOCAL
  ? new SimpleLogger()
  : new YandexCloudSimpleLogger();

const tokenService = IS_LOCAL
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

    driver = new Driver({
      connectionString: process.env.YDB_CONNECTION_STRING,
      authService,
      logger,
    });

    process.on('exit', () => {
      driver!.destroy();
      if (tokenService instanceof MetadataTokenServiceNew) {
        tokenService.destroy();
      }
    });

    // await driver.ready(parseInt(process.env.YDB_TIMEOUT as string) || 15_000);

    logger.debug('Driver initialized');
  }
};
