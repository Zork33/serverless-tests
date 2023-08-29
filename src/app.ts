import { YandexCloudLogger } from './utils/yandex-cloud-logger';

import * as dotenv from 'dotenv';
import { start } from 'repl';

dotenv.config();

const logger = new YandexCloudLogger({ showLevel: true, showTimestamp: true });

const started: number = Date.now();

class Interval {
  constructor(readonly periodSecs: number) {}

  toString() {
    const h = Math.trunc(this.periodSecs / 60 / 60);
    const m = Math.trunc(this.periodSecs / 60) - h * 60;
    const s = Math.trunc(this.periodSecs % 60);
    return `${h}h ${m}m ${s}s`;
  }
}

export const handler = async (
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
      new Interval((context.token as any).expires_in),
      new Interval((Date.now() - started) / 1000),
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
