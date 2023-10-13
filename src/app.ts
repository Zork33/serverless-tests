// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import assert from 'assert';
import { handler, logger } from './handler';
import {
  HANDLER_REPEATE_INTERVAL,
  IS_LOCAL,
  IS_SERVERLESS,
  logConfig,
} from './consts';

logger.info('Started...');

logConfig(logger);

// assert(IS_LOCAL || !IS_SERVERLESS, 'Got to be local or non-serverless run');

(async function doItAgain() {
  logger.info('Once again...');

  await handler({}, {});

  setTimeout(doItAgain, HANDLER_REPEATE_INTERVAL);
})();
