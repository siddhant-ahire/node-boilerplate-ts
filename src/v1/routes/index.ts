import { Router } from 'express';
import healthRoute from '@/src/v1/controllers/healthcheck';
import usersRoute from '@/src/v1/controllers/user';

const router: Router = Router();

router.use('/health', healthRoute);
router.use('/user', usersRoute);

export default router;
