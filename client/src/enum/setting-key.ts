import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { KoboBook } from '@/dto/kobo-book';

export enum SettingKey {
  Books = 'books',
  NotionAuth = 'notion-auth',
  NotionExportTargetPageId = 'notion-export-target-page-id',
}

export type SettingValueType = {
  [SettingKey.Books]: KoboBook[];
  [SettingKey.NotionAuth]: OauthTokenResponse;
  [SettingKey.NotionExportTargetPageId]: string;
};
