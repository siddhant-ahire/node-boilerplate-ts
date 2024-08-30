import winston from 'winston';
const RnR = require('runtime-node-refresh');
import httpContext from 'express-http-context';
import config from '@/src/common/config/config';

interface CustomErrorTemp {
  timestamp?: string;
  level: string;
  message: string;
  stack?: string;
}

const errorStackFormat = winston.format((info) => {
  if (info instanceof Error) {
    return {
      ...info,
      stack: info.stack,
      message: info.message,
    };
  }
  return info;
});

const errorTemplate = ({
  timestamp,
  level,
  message,
  stack,
}: CustomErrorTemp & { timestamp?: string; stack?: string }): string => {
  const reqId = httpContext.get('ReqId');
  let tmpl = `${timestamp}`;
  if (reqId) tmpl += ` ${reqId}`;
  tmpl += ` ${level} ${message}`;
  if (stack) tmpl += ` \n ${stack}`;
  return tmpl;
};

const logger: winston.Logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    errorStackFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    config.env === 'development'
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(errorTemplate)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    new winston.transports.File({
      filename: 'logs/all-logs.log', // Specify the file name and path
      level: 'info', // Log all messages with level 'info' and above
    }),
  ],
});

const avbLogLevels = [
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
];

let currentLogLevel: number = logger.levels[logger.level];

logger.info(`Logger level is set to ${logger.level}`);

// Refresh log level on runtime
RnR(() => {
  if (currentLogLevel < avbLogLevels.length - 1) {
    currentLogLevel += 1;
  } else {
    currentLogLevel = 0;
  }
  const found = Object.entries(logger.levels).find(
    ([, value]) => value === currentLogLevel
  );
  if (found && found.length) {
    console.log(
      `${new Date().toISOString()} system: Switch logger level from ${
        logger.level
      } to ${found[0]}`
    );
    logger.level = found[0];
  }
});

export default logger;
