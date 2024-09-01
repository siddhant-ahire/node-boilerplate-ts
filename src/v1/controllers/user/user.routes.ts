import { Router } from 'express';
import {
  getUser,
  register,
  login,
  refreshAccessToken,
  logout,
} from './user.controller';
import authMiddleware from '@/src/v1/middlewares/authMiddleware';
const router: Router = Router();

// register a new user
router.post('/register', register);

// login a user
router.post('/login', login);

// refresh access token
router.post('/refresh-token', refreshAccessToken);

// logout
router.post('/logout', logout);

// get User Profile
router.get('/', authMiddleware, getUser);

export default router;
