import { Response } from 'express';

interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  error?: unknown;
}

export const successResponse = <T>(
  message: string,
  data: T
): ApiResponse<T> => {
  return {
    status: 'success',
    message,
    data,
  };
};

export const errorResponse = (
  res: Response,
  message: string,
  error?: unknown
): ApiResponse<null> => {
  res.locals.errorMessage = message + ' || ' + error;
  return {
    status: 'error',
    message,
    error,
  };
};
