import { Router } from 'express';
import healthRoute from '@/src/v1/controllers/healthcheck/healthcheck';
import usersRoute from '@/src/v1/controllers/auth/auth.routes';

const router: Router = Router();

router.use('/health', healthRoute);
router.use('/auth', usersRoute);

export default router;
