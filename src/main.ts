import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authExample } from './middlewares/auth-example.middleware';
import { Logger, ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true, trustProxy: true }),
    {
      bufferLogs: true,
      logger: false,
    },
  );
  // const app = await NestFactory.create(AppModule, {
  //   bufferLogs: true,
  //   logger: false,
  // });

  const logger = new ConsoleLogger();
  app.useLogger(logger);

  const API_SERVICE_URL = 'http://localhost:6007';

  app.use(authExample({ dependencies: { logger: logger } }));

  // Proxy endpoints
  app.use(
    '/pixwayid/api',
    createProxyMiddleware({
      target: API_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        [`^/pixwayid/api`]: '',
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('proxyReq: header', proxyReq.getHeader('x-authenticated'));
        console.log('req: header', req.headers['x-authenticated']);
      },
    }),
  );

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
