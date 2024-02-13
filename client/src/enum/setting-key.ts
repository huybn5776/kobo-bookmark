import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

export enum SettingKey {
  BookSorting = 'book-sorting',
  BookmarkSorting = 'bookmark-sorting',
  NotionAuth = 'notion-auth',
  NotionExportTargetPageId = 'notion-export-target-page-id',
  NotionExportTargetDatabaseId = 'notion-export-target-database-id',
}

export type SettingValueType = {
  [SettingKey.BookSorting]: BookSortingKey;
  [SettingKey.BookmarkSorting]: BookmarkSortingKey;
  [SettingKey.NotionAuth]: OauthTokenResponse;
  [SettingKey.NotionExportTargetPageId]: string;
  [SettingKey.NotionExportTargetDatabaseId]: string;
};
