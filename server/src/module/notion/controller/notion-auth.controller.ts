import { Controller, Post, Body } from '@nestjs/common';
import { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { NotionAuthApiService } from '@/module/notion/api/notion-auth-api.service';

@Controller('/notion')
export class NotionAuthController {
  constructor(private readonly notionAuthApiService: NotionAuthApiService) {}

  @Post('/oauth')
  getToken(@Body() { code, redirectUri }: { code: string; redirectUri: string }): Promise<OauthTokenResponse | null> {
    return this.notionAuthApiService.getToken(code, redirectUri);
  }
}
