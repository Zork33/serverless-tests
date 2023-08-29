import { YCServerlessLogger } from './utils/yc-serverless-logger';

import * as dotenv from 'dotenv';

dotenv.config();

const logger = new YCServerlessLogger({ showLevel: true, showTimestamp: true });

const started: number = Date.now();

export const handler = async (
  event: object,
  context: { [key in string]: unknown },
) => {
  try {
    // TODO: Add check that SA was provided

    logger.info(event, 'event');
    logger.info(context, 'context');

    const h = Math.trunc((context.token as any).expires_in / 60 / 60);
    const m = Math.trunc((context.token as any).expires_in / 60) - h * 60;

    logger.warn(
      'Token TTL: %d h %d m; Working from start %d h',
      h,
      m,
      (Date.now() - started) / 1000 / 60 / 60,
    );
  } catch (error) {
    logger.error(error, (error as Error).message);
    throw error;
  }
};
