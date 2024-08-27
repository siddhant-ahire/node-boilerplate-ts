import * as Joi from 'joi';

// Joi schema for request validation

export const registerUser = Joi.object({
    user_name: Joi.string().required(),
    user_email: Joi.string().email().required(),
    user_password: Joi.string().required()
  });
  
  

export const loginUser = Joi.object({
    user_email: Joi.string().email().required(),
    user_password: Joi.string().required()
  });
  
  