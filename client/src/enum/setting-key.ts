import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { MarkdownExportMode } from '@/enum/markdown-export-mode';
import { NotionExportToType } from '@/enum/notion-export-to-type';
import { TextExportMode } from '@/enum/text-export-mode';

export enum SettingKey {
  BookSorting = 'book-sorting',
  BookmarkSorting = 'bookmark-sorting',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  TextExportMode = 'text-export-mode',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  MarkdownExportMode = 'markdown-export-mode',
  NotionAuth = 'notion-auth',
  NotionExportTo = 'notion-export-to',
  NotionExportTargetPageId = 'notion-export-target-page-id',
  NotionExportTargetPageTitle = 'notion-export-target-page-title',
  NotionExportTargetDatabaseId = 'notion-export-target-database-id',
  NotionExportTargetDatabaseTitle = 'notion-export-target-database-title',
}

export type SettingValueType = {
  [SettingKey.BookSorting]: BookSortingKey;
  [SettingKey.BookmarkSorting]: BookmarkSortingKey;
  [SettingKey.TextExportMode]: TextExportMode;
  [SettingKey.MarkdownExportMode]: MarkdownExportMode;
  [SettingKey.NotionAuth]: OauthTokenResponse;
  [SettingKey.NotionExportTargetPageId]: string;
  [SettingKey.NotionExportTo]: NotionExportToType;
  [SettingKey.NotionExportTargetPageTitle]: string;
  [SettingKey.NotionExportTargetDatabaseId]: string;
  [SettingKey.NotionExportTargetDatabaseTitle]: string;
};
