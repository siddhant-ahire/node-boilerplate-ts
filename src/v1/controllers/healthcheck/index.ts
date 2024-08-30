import { Router } from 'express';
import httpStatus from 'http-status';
import { uptime } from 'process';
const router: Router = Router();

// healthcheck route
router.get('/', (req, res) => {
  res.status(httpStatus.OK);
  res.send({
    message: 'Hey everything is OK',
    uptime: uptime(),
    data: new Date().toJSON(),
  });
});

export default router;
