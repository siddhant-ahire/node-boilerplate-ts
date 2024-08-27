import { Request, Response } from 'express';

export interface Profile {
        user_id: bigint,
        user_name: string,
        user_email: string,
        user_password?: string,
}

export interface RequestWithProfile extends Request {
    profile?: Profile; 
  }
