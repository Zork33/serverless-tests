import { SimpleLogger } from 'nodejs-sdk-dev';
import path from 'path';

export const IS_LOCAL = process.env.TEST_LOCAL === '1';
export const IS_SERVERLESS = process.env.TEST_SERVERLESS !== '0';
export const USE_CONTEXT_TOKEN = process.env.TEST_CONTEXT_TOKEN === '1';
export const USE_OLD_TOKEN_SERVICE = process.env.TEST_OLD === '1';
export const HANDLER_REPEATE_INTERVAL = 5_000;
export const YDB_TOKEN = process.env.YDB_TOKEN;
export const YDB_CONNECTION_STRING = process.env.YDB_CONNECTION_STRING;
export const YDB_TIMEOUT = (process.env.YDB_TIMEOUT as string) || 15_000;
export const YDB_CERT_FILE =
  process.env.YDB_SSL_ROOT_CERTIFICATES_FILE ||
  path.join(process.cwd(), 'ydb_certs/ca.pem');

export const logConfig = (logger: SimpleLogger.Logger) => {
  logger.debug('IS_LOCAL: %s', IS_LOCAL);
  logger.debug('IS_SERVERLESS: %s', IS_SERVERLESS);
  logger.debug('USE_CONTEXT_TOKEN: %s', USE_CONTEXT_TOKEN);
  logger.debug('USE_OLD_TOKEN_SERVICE: %s', USE_OLD_TOKEN_SERVICE);
  logger.debug('HANDLER_REPEATE_INTERVAL: %s', HANDLER_REPEATE_INTERVAL);
  logger.debug('YDB_TOKEN: %s', YDB_TOKEN);
  logger.debug('YDB_CONNECTION_STRING: %s', YDB_CONNECTION_STRING);
  logger.debug('YDB_TIMEOUT: %s', YDB_TIMEOUT);
};
