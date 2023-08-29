import { YCServerlessLogger } from './utils/yc-serverless-logger';

import * as dotenv from 'dotenv';

dotenv.config();

export const handler = () => {
  // console.debug('debug');
  // console.info('info');
  // console.warn('warn');
  // console.error('an error: %s\n%O', '123', new Error('test'));

  const logger = new YCServerlessLogger();

  // logger.info('info');
  // logger.warn('warn');
  // logger.debug('debug');
  // logger.error('error: %s', 'abc');

  logger.info({ a: 12, b: 'test' }, 'info111\n123');
  logger.warn({ n: 121 }, 'warn\nwarn2');
  logger.debug({ f: true }, 'debug');
  logger.error(new Error('test error'), 'error: 432', 'abc');
};

const logger = new YCServerlessLogger({ showLevel: true, showTimestamp: true });

logger.info({ a: 12, b: 'test' }, 'info111\n123');
logger.warn({ n: 121 }, 'warn\nwarn2');
logger.debug({ f: true }, 'debug');
logger.error(new Error('test error'), 'error: 432', 'abc');
