import { Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Client } from '@notionhq/client';
import { Request } from 'express';

import { NotionAuthApiService } from '@/module/notion/api/notion-auth-api.service';
import { NotionBlockApiService } from '@/module/notion/api/notion-block-api.service';
import { NotionDatabaseApiService } from '@/module/notion/api/notion-database-api.service';
import { NotionPageApiService } from '@/module/notion/api/notion-page-api.service';
import { NotionAuthController } from '@/module/notion/controller/notion-auth.controller';
import { NotionBlockController } from '@/module/notion/controller/notion-block.controller';
import { NotionDatabaseController } from '@/module/notion/controller/notion-database.controller';
import { NotionPageController } from '@/module/notion/controller/notion-page.controller';

@Module({
  imports: [],
  controllers: [NotionAuthController, NotionPageController, NotionBlockController, NotionDatabaseController],
  providers: [
    {
      provide: Client,
      useFactory: (request: Request) => {
        const authorizationHeader = request.headers.authorization;
        const auth = authorizationHeader?.split(' ')[1];
        return new Client({ auth });
      },
      inject: [{ token: REQUEST, optional: false }],
      scope: Scope.REQUEST,
    },
    NotionAuthApiService,
    NotionPageApiService,
    NotionBlockApiService,
    NotionDatabaseApiService,
  ],
})
export class NotionModule {}
