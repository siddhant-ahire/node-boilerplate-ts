import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';

import AppError from '@/src/common/utils/appError';
import logger from '@/src/common/utils/logger';
import consts from '@/src/common/config/consts';
import swaggerDocument from '@/src/swagger.json';
import swaggerDocumentV1 from '@/src/swagger.json';
import swaggerDocumentV2 from '@/src/swagger1.json';

const swaggerForbidden = () => {
  logger.error('Trying to access swagger docs on production');
  throw new AppError(
    httpStatus.FORBIDDEN,
    'API docs are not available on production'
  );
};

const swaggerBasePath = (req: Request, res: Response, next: NextFunction) => {
  const version = (req.params.version as string) || 'v1'; // Default to 'v1' if no version is provided
  const swaggerFile = version == 'v1' ? swaggerDocumentV1 : swaggerDocumentV2;
  const basePath: string = req.originalUrl.replace(
    `${consts.API_DOCS_PATH}/${version}`,
    ''
  );
  swaggerFile.basePath = `${basePath}api/${version}`;
  swaggerFile.info.version = version;
  // Check if the request is made over HTTPS and ensure only "https" remains in the schemes
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    swaggerFile.schemes = ['https'];
  }
  swaggerUi.setup(swaggerFile)(req, res, () => {
    next();
  });
};

export { swaggerBasePath, swaggerForbidden };
