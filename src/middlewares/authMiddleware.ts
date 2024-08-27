const jwt = require("jsonwebtoken");
import { RequestWithProfile } from '@/src/types';
import { NextFunction, Response } from 'express';
import { errorResponse } from '../services/response';
import prisma from '@/src/db';

export default async (req: RequestWithProfile , res: Response, next: NextFunction) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    const decryptedToken = jwt.verify(token, process.env.jwt_secret);
    const profile = await prisma.user.findUnique({
      where: { user_email: decryptedToken.user_id, user_deleted: false, user_active: true},
    });
    if(profile) {
      req.profile = profile
      next();
    } else {
      return res.status(401).json(errorResponse('User Not Authenticated'));
    }
  } catch (error: any) {
    return res.status(500).json(errorResponse('Error in auth middleware', error.message));

  }
};
