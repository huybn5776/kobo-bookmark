import { Module } from '@nestjs/common';

import { NotionAuthController } from '@/module/notion/controller/notion-auth.controller';
import { NotionAuthApiService } from '@/module/notion/service/notion-auth-api.service';

@Module({
  imports: [],
  controllers: [NotionAuthController],
  providers: [NotionAuthApiService],
})
export class NotionModule {}
