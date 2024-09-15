import express, { Application } from 'express';
import httpContext from 'express-http-context';
import helmet from 'helmet';
import cors from 'cors';
import routes from '@/src/v1/routes';
import httpLogger from '@/src/common/utils/httpLogger';
import errorHandling from '@/src/common/middlewares/errorHandling.middleware';
import uniqueReqId from '@/src/common/middlewares/uniqueReqId.middleware';
import http404 from '@/src/common/404/404.router';
import swaggerApiDocs from '@/src/swagger-ui/swagger.router';
import cookieParser from 'cookie-parser';

const app: Application = express();
app.use(helmet());
app.use(swaggerApiDocs);
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5002']; // Add your frontend URL
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (origin === undefined) {
        return callback(null, true); // its a request from the same origin
      }
      if (
        typeof origin === 'string' &&
        (allowedOrigins.indexOf(origin) !== -1 || !origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow credentials
  })
);
// Handle OPTIONS preflight requests
app.options('*', cors());
app.use(httpContext.middleware);
app.use(httpLogger.successHandler);
app.use(httpLogger.errorHandler);
app.use(uniqueReqId);
app.use(express.json());
app.use('/api/v1', routes);
app.use(http404);

app.use(errorHandling);

export default app;
