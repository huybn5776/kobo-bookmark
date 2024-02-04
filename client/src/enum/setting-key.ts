import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { KoboBook } from '@/dto/kobo-book';

export enum SettingKey {
  Books = 'books',
  NotionAuth = 'notion-auth',
}

export type SettingValueType = {
  [SettingKey.Books]: KoboBook[];
  [SettingKey.NotionAuth]: OauthTokenResponse;
};
