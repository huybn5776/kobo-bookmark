import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

export enum SettingKey {
  BookSorting = 'book-sorting',
  BookmarkSorting = 'bookmark-sorting',
  NotionAuth = 'notion-auth',
  NotionExportTargetPageId = 'notion-export-target-page-id',
  NotionExportTargetPageTitle = 'notion-export-target-page-title',
  NotionExportTargetDatabaseId = 'notion-export-target-database-id',
  NotionExportTargetDatabaseTitle = 'notion-export-target-database-title',
}

export type SettingValueType = {
  [SettingKey.BookSorting]: BookSortingKey;
  [SettingKey.BookmarkSorting]: BookmarkSortingKey;
  [SettingKey.NotionAuth]: OauthTokenResponse;
  [SettingKey.NotionExportTargetPageId]: string;
  [SettingKey.NotionExportTargetPageTitle]: string;
  [SettingKey.NotionExportTargetDatabaseId]: string;
  [SettingKey.NotionExportTargetDatabaseTitle]: string;
};
