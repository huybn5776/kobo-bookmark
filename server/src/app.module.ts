import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ImageProxyModule } from '@/module/image-proxy/image-proxy.module';
import { NotionModule } from '@/module/notion/notion.module';

@Module({
  imports: [ConfigModule.forRoot(), NotionModule, ImageProxyModule],
})
export class AppModule {}
