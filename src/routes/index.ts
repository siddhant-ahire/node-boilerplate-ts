import { Router } from 'express';
import usersRoute from '@/src/controllers/user';

const router: Router = Router();

router.use('/user', usersRoute);

export default router;
