import { CustomError, RequestWithProfile } from '@/src/v1/types';
import { Request, Response } from 'express';
import crypto from 'crypto';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { successResponse, errorResponse } from '@/src/v1/services/response';
import { logger } from '@/src/v1/services/logger';
import {
  loginUser,
  registerUser,
  refreshTokenUser,
  googleLoginUser,
  requestPasswordResetUser,
  resetPasswordUser,
} from './auth.joi.model';
import prisma from '@/src/db';
import {
  generateAccessToken,
  generateRefreshToken,
  sendEmailInChildProcess,
} from '@/src/v1/helper/authHelper';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      return res.status(400).json(errorResponse(res, 'User already exists'));
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
      return res.status(400).json(errorResponse(res, 'User not found'));
    }

    // check if the password is correct
    const passwordCorrect = await bcrypt.compare(
      req.body.user_password,
      user.user_password
    );
    if (!passwordCorrect) {
      return res.status(400).json(errorResponse(res, 'Invalid password'));
    }

    // create and assign a token
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { user_refreshToken: refreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Set to true for better security setting false becuase its used for client side only
      secure: process.env.NODE_ENV === 'production', // Use true for production
      sameSite: 'lax', // Use 'lax' if you're dealing with cross-origin issues
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .json(successResponse('User logged in successfully', accessToken));
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

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validate the request parameters
    const { error } = googleLoginUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(res, error.details[0].message));
    }
    const { token } = req.body;

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json(errorResponse(res, 'Invalid token'));
    }

    // Check if user exists or create a new user
    const email = payload.email;
    if (typeof email === 'undefined') {
      return res.status(400).json(errorResponse(res, 'Invalid email'));
    }
    let user = await prisma.user.findUnique({ where: { user_email: email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          user_name: payload.name || '',
          user_email: email,
          user_password: '',
        },
      });
    }

    // Generate a session or JWT token for the user
    // create and assign a token
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { user_refreshToken: refreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(200)
      .json(successResponse('User logged in successfully', accessToken));
    // Example response with user details
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in google login', customError.message));
  }
};

export async function refreshAccessToken(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    // Validate the request parameters
    const { error } = refreshTokenUser.validate(req.cookies);

    if (error) {
      return res.status(400).json(errorResponse(res, error.details[0].message));
    }
    const refreshToken = req.cookies.refreshToken;
    const user = await prisma.user.findFirst({
      where: { user_refreshToken: refreshToken },
    });
    if (!user) {
      return res.status(403).json(errorResponse(res, 'Invalid refresh token'));
    }

    return jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
      (err: Error, decoded: { user_id: number | string }) => {
        if (err || user.user_id !== decoded.user_id) {
          return res.status(403).json(errorResponse(res, 'Forbidden'));
        }

        const newAccessToken = generateAccessToken(user.user_id);
        return res
          .status(200)
          .json(
            successResponse(
              'Access token refreshed successfully.',
              newAccessToken
            )
          );
      }
    );
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in Refreshtoken', customError.message));
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    // Validate the request parameters
    const { error } = requestPasswordResetUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(res, error.details[0].message));
    }
    const { email } = req.body;

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { user_email: email } });
    if (!user) {
      return res.status(404).json(errorResponse(res, 'User not found'));
    }

    // Generate a reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    // Save the reset token and expiration time in the database
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        reset_token: resetToken,
        reset_token_expiration: resetTokenExpiration,
      },
    });
    sendEmailInChildProcess(email, resetToken);
    return res
      .status(200)
      .json(successResponse('Password reset email sent successfully', null));
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(
        errorResponse(res, 'Error in requestPasswordReset', customError.message)
      );
  }
}

export async function resetPassword(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    // Validate the request parameters
    const { error } = resetPasswordUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(res, error.details[0].message));
    }

    const { token, new_password } = req.body;

    // Check if the reset token is valid
    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiration: { gt: new Date() }, // Token should be valid
      },
    });
    if (!user) {
      return res
        .status(400)
        .json(errorResponse(res, 'Invalid or expired reset token'));
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update the user's password and clear the reset token
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        user_password: hashedPassword,
        reset_token: null,
        reset_token_expiration: null,
      },
    });

    return res
      .status(200)
      .json(successResponse('Password has been reset successfully', null));
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in resetPassword', customError.message));
  }
}

export const logout = async (
  req: RequestWithProfile,
  res: Response
): Promise<Response> => {
  try {
    await prisma.user.update({
      where: { user_id: req.profile?.user_id },
      data: { user_refreshToken: null },
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.sendStatus(204);
  } catch (error) {
    const customError = error as CustomError;
    logger.error({
      message: customError.message,
      stack: customError.stack,
      apiEndpoint: req.originalUrl,
    });
    return res
      .status(500)
      .json(errorResponse(res, 'Error in logout', customError.message));
  }
};

export async function getUser(
  req: RequestWithProfile,
  res: Response
): Promise<Response> {
  try {
    delete req?.profile?.user_password;
    delete req?.profile?.user_refreshToken;
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
