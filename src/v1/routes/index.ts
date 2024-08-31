import { Router } from 'express';
import healthRoute from '@/src/v1/controllers/healthcheck/healthcheck';
import usersRoute from '@/src/v1/controllers/user/user.routes';

const router: Router = Router();

router.use('/health', healthRoute);
router.use('/user', usersRoute);

export default router;
