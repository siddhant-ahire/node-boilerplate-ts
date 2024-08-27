import { RequestWithProfile } from '@/src/types';
import { Request, Response } from 'express';
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { successResponse, errorResponse } from '@/src/services/response';
import { logger } from "@/src/services/logger";
import { loginUser, registerUser } from './userJoiModel';
import prisma from '@/src/db';

export async function register(req: Request, res: Response) {
  try {
    // Validate the request parameters
    const { error } = registerUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }
    // check if the user already exists
    const userExists = await prisma.user.findUnique({
      where: { user_email: req.body.user_email },
    });   
    if (userExists) {
      throw new Error("User already exists");
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.user_password, salt);
    req.body.user_password = hashedPassword;

    // Save the user
    await prisma.user.create({
      data: req.body
    });
    res.status(200).json(successResponse("User registered successfully", null));

  } catch (error: any) {
    logger.error({
      message: error.message,
      stack: error.stack,
      apiEndpoint: req.originalUrl
    });
    return res.status(500).json(errorResponse('Error in register', error.message));
  }
}

export async function login(req: Request, res: Response) {
  try {
    // Validate the request parameters
    const { error } = loginUser.validate(req.body);

    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }
    // check if the user exists
    const user = await prisma.user.findUnique({
      where: { user_email: req.body.user_email },
    });
    if (!user) {
      throw new Error("User does not exist");
    }

    // check if the password is correct
    const passwordCorrect = await bcrypt.compare(
      req.body.user_password,
      user.user_password
    );
    if (!passwordCorrect) {
      throw new Error("Invalid password");
    }

    // create and assign a token
    const token = jwt.sign({ user_id: user.user_id }, process.env.jwt_secret, {
      expiresIn: "1d",
    });
    res.status(200).json(successResponse("User logged in successfully", token));

  } catch (error: any) {
    logger.error({
      message: error.message,
      stack: error.stack,
      apiEndpoint: req.originalUrl
    });    
    return res.status(500).json(errorResponse('Error in login', error.message));
  }
}

export async function getUser(req: RequestWithProfile, res: Response) {
  try {
    delete req?.profile?.user_password;
    res.status(200).json(successResponse("User data found successfully", req.profile));
  } catch (error: any) {
    logger.error({
      message: error.message,
      stack: error.stack,
      apiEndpoint: req.originalUrl
    });
    return res.status(500).json(errorResponse('Error in getUser', error.message));
  }
}