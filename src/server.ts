require('module-alias/register');
import { Server } from 'http';
import app from '@/src/app';
import logger from '@/src/common/utils/logger';
import errorHandler from '@/src/common/utils/errorHandler';
require('dotenv').config();
const port = process.env.PORT || 5002;
const projectName = 'hshdhs';
const server: Server = app.listen(port, (): void => {
  logger.info(`Aapplication '${projectName}' listens on PORT: ${port}`);
});

const exitHandler = (): void => {
  if (typeof app === 'object' && app !== null) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error): void => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) {
    exitHandler();
  }
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
