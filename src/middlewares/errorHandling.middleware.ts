import { Request, Response, NextFunction } from 'express';

import httpStatus from 'http-status';
import AppError from '@/src/utils/appError';
import errorHandler from '@/src/utils/errorHandler';

// catch all unhandled errors
const errorHandling = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction,
): void => {
  errorHandler.handleError(error);
  const isTrusted = errorHandler.isTrustedError(error);
  const httpStatusCode = isTrusted
    ? (error as AppError).httpCode
    : httpStatus.INTERNAL_SERVER_ERROR;
  const responseError = isTrusted
    ? error.message
    : httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  console.log('httpStatusCode, reportErro', httpStatusCode, reportError);
  res.status(httpStatusCode).json({
    error: responseError,
  });
};

export default errorHandling;
