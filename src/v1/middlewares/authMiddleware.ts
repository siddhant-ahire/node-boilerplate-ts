const jwt = require('jsonwebtoken');
import { CustomError, RequestWithProfile } from '@/src/v1/types';
import { NextFunction, Response } from 'express';
import { errorResponse } from '../services/response';
import prisma from '@/src/db';

export default async (
  req: RequestWithProfile,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req?.headers?.authorization?.split(' ')[1];
    const decryptedToken = jwt.verify(token, process.env.API_KEY_TOKEN);
    if (decryptedToken) {
      const profile = await prisma.user.findUnique({
        where: {
          user_id: decryptedToken.user_id,
          user_deleted: false,
          user_active: true,
        },
      });
      if (profile) {
        req.profile = profile;
        next();
      } else {
        res.status(401).json(errorResponse(res, 'User Not Authenticated'));
      }
    } else {
      res.status(401).json(errorResponse(res, 'User Not Authenticated'));
    }
  } catch (error) {
    const customError = error as CustomError;
    res
      .status(500)
      .json(
        errorResponse(res, 'Error in auth middleware', customError.message)
      );
  }
};
