import { CustomError, RequestWithProfile } from '@/src/v1/types';
import { Request, Response } from 'express';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { successResponse, errorResponse } from '@/src/v1/services/response';
import { logger } from '@/src/v1/services/logger';
import { loginUser, registerUser } from './user.joi.model';
import prisma from '@/src/db';

export async function register(req: Request, res: Response): Promise<Response> {
  try {
    // Validate the request parameters
    const { error } = registerUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(res, error.details[0].message));
    }
    // check if the user already exists
    const userExists = await prisma.user.findUnique({
      where: { user_email: req.body.user_email },
    });
    if (userExists) {
      throw new Error('User already exists');
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.user_password, salt);
    req.body.user_password = hashedPassword;

    // Save the user
    await prisma.user.create({
      data: req.body,
    });
    return res
      .status(200)
      .json(successResponse('User registered successfully', null));
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in register', customError.message));
  }
}

export async function login(req: Request, res: Response): Promise<Response> {
  try {
    // Validate the request parameters
    const { error } = loginUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(res, error.details[0].message));
    }
    // check if the user exists
    const user = await prisma.user.findUnique({
      where: { user_email: req.body.user_email },
      select: {
        user_password: true,
        user_id: true,
      },
    });
    if (!user) {
      throw new Error('User does not exist');
    }

    // check if the password is correct
    const passwordCorrect = await bcrypt.compare(
      req.body.user_password,
      user.user_password
    );
    if (!passwordCorrect) {
      throw new Error('Invalid password');
    }

    // create and assign a token
    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      }
    );
    return res
      .status(200)
      .json(successResponse('User logged in successfully', token));
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in login', customError.message));
  }
}

export async function getUser(
  req: RequestWithProfile,
  res: Response
): Promise<Response> {
  try {
    delete req?.profile?.user_password;
    return res
      .status(200)
      .json(successResponse('User data found successfully', req.profile));
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in getUser', customError.message));
  }
}
