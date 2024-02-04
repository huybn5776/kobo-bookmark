import { Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Client } from '@notionhq/client';
import { Request } from 'express';

import { NotionAuthApiService } from '@/module/notion/api/notion-auth-api.service';
import { NotionAuthController } from '@/module/notion/controller/notion-auth.controller';

@Module({
  imports: [],
  controllers: [NotionAuthController],
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
  ],
})
export class NotionModule {}
