import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NotionModule } from '@/module/notion/notion.module';

@Module({
  imports: [ConfigModule.forRoot(), NotionModule],
})
export class AppModule {}
