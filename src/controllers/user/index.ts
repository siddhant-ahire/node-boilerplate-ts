import { Router } from 'express';
import { getUser, register, login } from './userController';
import authMiddleware from '@/src/middlewares/authMiddleware';
const router: Router = Router();

// register a new user
router.post('/register', register);

// login a user
router.post('/login', login);

// get User Profile
router.get('/', authMiddleware, getUser);

export default router;
