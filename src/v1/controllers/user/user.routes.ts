import { Router } from 'express';
import { getUser, register, login } from './user.controller';
import authMiddleware from '@/src/v1/middlewares/authMiddleware';
const router: Router = Router();

// register a new user
router.post('/register', register);

// login a user
router.post('/login', login);

// get User Profile
router.get('/', authMiddleware, getUser);

export default router;
