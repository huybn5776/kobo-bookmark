import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { BookCollections } from '@/dto/book-collection';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookSortingPriorityKey } from '@/enum/book-sorting-priority-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { MarkdownExportMode } from '@/enum/markdown-export-mode';
import { NotionExportToType } from '@/enum/notion-export-to-type';
import { TextExportMode } from '@/enum/text-export-mode';
import { DropboxTokenInfo } from '@/interface/dropbox-token-info';

export enum SettingKey {
  ImportDataInstructionCollapsed = 'import-data-instruction-collapsed',
  BookmarksToolbarPinned = 'bookmarks-toolbar-pinned',
  BookCollection = 'book-collection',
  BookSortingPriority = `book-sorting-priority`,
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
  DropboxToken = 'dropbox-token',
  ShowRemovedBooksWhenImporting = 'show-removed-books-when-importing',
  ShowArchived = 'show-archived',
  Language = 'language',
}

export type SettingValueType = {
  [SettingKey.ImportDataInstructionCollapsed]: boolean;
  [SettingKey.BookmarksToolbarPinned]: boolean;
  [SettingKey.BookCollection]: BookCollections;
  [SettingKey.BookSortingPriority]: BookSortingPriorityKey;
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
  [SettingKey.DropboxToken]: DropboxTokenInfo;
  [SettingKey.ShowRemovedBooksWhenImporting]: boolean;
  [SettingKey.ShowArchived]: boolean;
  [SettingKey.Language]: string;
};
