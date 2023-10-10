import { YandexCloudSimpleLogger } from 'yc-simple-logger';
import { HRInterval } from 'nodejs-sdk-dev/dist/utils/hr-interval';

import * as dotenv from 'dotenv';

dotenv.config();

const logger = new YandexCloudSimpleLogger({
  showLevel: true,
  showTimestamp: true,
});

const started: number = Date.now();

export const checkServerlessContext = async (
  event: object,
  context: { [key in string]: unknown },
) => {
  try {
    if ((context.token as any) === undefined) {
      throw new Error('SA is not specified for serverless function');
    }

    // TODO: Add check that SA was provided

    logger.info(event, 'event');
    logger.info(context, 'context');

    logger.warn(
      'Token TTL: %s; Time from build: %s',
      new HRInterval((context.token as any).expires_in),
      new HRInterval((Date.now() - started) / 1000),
    );
  } catch (error) {
    logger.error(error, (error as Error).message);
    throw error;
  }

  return {
    statusCode: 200,
    body: {},
  };
};
