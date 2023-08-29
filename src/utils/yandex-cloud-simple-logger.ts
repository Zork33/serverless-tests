// eslint-disable-next-line @typescript-eslint/no-var-requires
const format = require('quick-format-unescaped'); // same formater as the one is used in pino.js

const DEFAULT_ENV_KEY = 'LOG_LEVEL';

const DEFAULT_LEVEL = 'info';

const silentLogFn = () => {};

const yandexCloudLogFnBuilder = (
  level: YandexCloudSimpleLogger.LogLevel,
): YandexCloudSimpleLogger.LogFn => {
  const LEVEL = level.toUpperCase();

  return function log(
    this: YandexCloudSimpleLogger,
    objOrMsg: string | unknown,
    ...args: unknown[]
  ) {
    if (typeof objOrMsg === 'object') {
      // TODO: Later add from pino
      // if (msg === null && n.length === 0) {
      //     formatParams = [null]
      // } else {
      //     msg = n.shift()
      //     formatParams = n
      // }

      consoleOrMock[level === 'error' ? 'error' : 'log'](
        JSON.stringify({
          ...(objOrMsg instanceof Error ? { stack: objOrMsg.stack } : objOrMsg),
          level: LEVEL,
          msg: format(args[0] ?? level, args.splice(1)),
        }),
      );
    } else {
      consoleOrMock[level === 'error' ? 'error' : 'log'](
        JSON.stringify({
          level: LEVEL,
          msg: format(objOrMsg, args),
        }),
      );
    }
  };
};

/**
 * The simplest logger class, with a minimal set of logging methods and the most simple output to the console.
 */
export class YandexCloudSimpleLogger implements YandexCloudSimpleLogger.Logger {
  error: YandexCloudSimpleLogger.LogFn = silentLogFn;
  warn: YandexCloudSimpleLogger.LogFn = silentLogFn;
  info: YandexCloudSimpleLogger.LogFn = silentLogFn;
  debug: YandexCloudSimpleLogger.LogFn = silentLogFn;

  showTimestamp: boolean;
  showLevel: boolean;

  constructor(
    options: {
      /**
       * Level down to which to log messages. Default is *info*.
       */
      level?: YandexCloudSimpleLogger.LogLevel;
      /**
       * Whether to add the date and time to the message. Default is false.
       */
      readonly showTimestamp?: boolean;
      /**
       * Whether to add the message level. Default is false
       */
      readonly showLevel?: boolean;
      /**
       * Environment variable with logging level, which if specified contains the level of
       * logging - *error*, *warn*, *info*, *debug*. If not specified, the value of level parameter
       * is used.  If a non-existing level value is specified, all levels are logged.
       */
      envKey?: string;
    } = {},
  ) {
    let {
      level,
      // eslint-disable-next-line prefer-const
      showTimestamp,
      // eslint-disable-next-line prefer-const
      showLevel,
    } = options;

    this.showTimestamp = showTimestamp ?? false;
    this.showLevel = showLevel ?? false;

    // eslint-disable-next-line no-param-reassign
    const envKey = options.envKey ?? DEFAULT_ENV_KEY;
    const envLevel = process.env[envKey];

    level =
      envLevel !== undefined
        ? Object.entries(YandexCloudSimpleLogger.LogLevel).find(
            (v) => v[0] === envLevel,
          )?.[1]
        : level ?? YandexCloudSimpleLogger.LogLevel[DEFAULT_LEVEL];

    for (const lvl of Object.values<YandexCloudSimpleLogger.LogLevel>(
      YandexCloudSimpleLogger.LogLevel,
    )) {
      this[lvl] = yandexCloudLogFnBuilder(lvl);
      if (lvl === level) break;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace YandexCloudSimpleLogger {
  export interface LogFn {
    (obj: unknown, msg?: string, ...args: unknown[]): void;

    (msg: string, ...args: unknown[]): void;
  }

  /**
   * The simplest interface, containing only the necessary methods used in the project.
   * Therefore, *fatal* and *trace* methods are omitted.
   */
  export interface Logger {
    error: LogFn;
    warn: LogFn;
    info: LogFn;
    debug: LogFn;
  }

  export enum LogLevel {
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug',
  }
}

/**
 * For unit tests purposes.
 */
let consoleOrMock = console;

/**
 * **Only for unit tests purposes**.
 */
export const setMockConsole = (mockConsole: Console = console) => {
  consoleOrMock = mockConsole;
};
