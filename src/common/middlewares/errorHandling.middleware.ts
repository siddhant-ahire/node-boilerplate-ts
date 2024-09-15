import { Request, Response, NextFunction } from 'express';
import AppError from '@/src/common/utils/appError';

const errorHandling = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    // Custom handling for AppError
    res.status(err.httpCode).json({
      message: err.message,
      // Additional error details if needed
    });
  } else {
    // General error handling
    console.error(err);
    res.status(500).json({
      message: 'An unexpected error occurred',
    });
  }
};

export default errorHandling;
