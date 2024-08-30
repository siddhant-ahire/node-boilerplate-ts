import express, { Application } from 'express';

import routes from '@/src/routes';
import httpContext from 'express-http-context';
import consts from '@/src/config/consts';
import httpLogger from '@/src/utils/httpLogger';
import errorHandling from '@/src/middlewares/errorHandling.middleware';
import uniqueReqId from '@/src/middlewares/uniqueReqId.middleware';
import http404 from '@/src/404/404.router';
// import swaggerApiDocs from '@components/swagger-ui/swagger.router';

const app: Application = express();

app.use(httpContext.middleware);
app.use(httpLogger.successHandler);
app.use(httpLogger.errorHandler);
app.use(uniqueReqId);
app.use(express.json());
app.use(consts.API_ROOT_PATH, routes);
// app.use(swaggerApiDocs);
app.use(http404);

app.use(errorHandling);

export default app;
