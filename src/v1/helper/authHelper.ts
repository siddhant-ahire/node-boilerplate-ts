const jwt = require('jsonwebtoken');

export const generateAccessToken = (user_id: number): string => {
  return jwt.sign({ user_id }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });
};

export const generateRefreshToken = (user_id: number): string => {
  return jwt.sign({ user_id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  });
};
