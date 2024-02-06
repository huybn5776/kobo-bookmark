import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { KoboBook } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

export enum SettingKey {
  Books = 'books',
  BookSorting = 'book-sorting',
  BookmarkSorting = 'bookmark-sorting',
  NotionAuth = 'notion-auth',
  NotionExportTargetPageId = 'notion-export-target-page-id',
}

export type SettingValueType = {
  [SettingKey.Books]: KoboBook[];
  [SettingKey.BookSorting]: BookSortingKey;
  [SettingKey.BookmarkSorting]: BookmarkSortingKey;
  [SettingKey.NotionAuth]: OauthTokenResponse;
  [SettingKey.NotionExportTargetPageId]: string;
};
