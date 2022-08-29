import { LoggerService } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

interface Dependencies {
  logger: LoggerService;
}

interface AsyncResolverExample {
  authenticated: boolean;
  jwt?: string;
}

const asyncResolverExample = (
  params: { apiKey: string; apiSecret: string },
  dependencies: Dependencies,
): Promise<AsyncResolverExample> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      dependencies.logger.log('asyncResolverExample');
      if (Math.random() > 0.5) {
        resolve({
          authenticated: true,
          jwt: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
        });
      } else {
        reject(new Error('asyncResolverExample error'));
      }
    }, 1000);
  });
};

export const authExample =
  ({ dependencies }: { dependencies: Dependencies }) =>
    (req: Request, res: Response, next: NextFunction) => {
      console.log('###################################################');
      console.log('authExample', req.headers);
      dependencies?.logger?.log('authExample');
      console.log('###################################################');

      asyncResolverExample(
        {
          apiKey: req.headers['x-api-key'] as string,
          apiSecret: req.headers['x-api-secret'] as string,
        },
        dependencies,
      )
        .then((result: AsyncResolverExample) => {
          console.log('result', result);
          req.headers[
            'x-authenticated'
          ] = `Authenticated ${result.authenticated}`;
          next();
        })
        .catch((error) => {
          console.log('error', error);

          res.status(401).send({
            message: 'Unauthorized',
          });
        });
    };
