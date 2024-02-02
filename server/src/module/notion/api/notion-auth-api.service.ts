import { Injectable, BadRequestException } from '@nestjs/common';
import { Client, UnknownHTTPResponseError } from '@notionhq/client';
import { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionAuthApiService {
  notionClientId = process.env.NOTION_CLIENT_ID;
  notionClientSecret = process.env.NOTION_CLIENT_SECRET;

  async getToken(code: string): Promise<OauthTokenResponse | null> {
    try {
      return await new Client().oauth.token({
        code,
        grant_type: 'authorization_code',
        client_id: this.notionClientId,
        client_secret: this.notionClientSecret,
      });
    } catch (e) {
      const error = e as UnknownHTTPResponseError;
      const body = JSON.parse(error.body);
      throw new BadRequestException(body.error_description);
    }
  }
}
