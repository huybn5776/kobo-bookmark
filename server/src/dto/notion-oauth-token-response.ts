import { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

export interface NotionOauthTokenResponse extends OauthTokenResponse {
  error?: string;
  error_description?: string;
}
