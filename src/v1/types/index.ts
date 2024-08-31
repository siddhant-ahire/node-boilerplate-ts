import { Request } from 'express';

export interface Profile {
  user_id: number;
  user_name: string;
  user_email: string;
  user_password?: string;
}

export interface RequestWithProfile extends Request {
  profile?: Profile;
}

export interface CustomError extends Error {
  // You can add more properties if needed
  statusCode?: number;
}
