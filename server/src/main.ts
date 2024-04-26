import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.use('/api/dropbox-proxy', createProxyMiddleware({ target: 'https://www.dropbox.com', changeOrigin: true }));
  await app.listen(5000);
}
bootstrap();
