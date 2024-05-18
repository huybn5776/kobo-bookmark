import { z } from 'zod';

import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookSortingPriorityKey } from '@/enum/book-sorting-priority-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { MarkdownExportMode } from '@/enum/markdown-export-mode';
import { NotionExportToType } from '@/enum/notion-export-to-type';
import { SettingKey } from '@/enum/setting-key';
import { TextExportMode } from '@/enum/text-export-mode';

const notionOauthResponseSchema = z.object({
  access_token: z.string(),
  bot_id: z.string(),
  workspace_name: z.string(),
  workspace_id: z.string(),
  duplicated_template_id: z.string().optional().nullable(),
});

const bookCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  bookIds: z.array(z.string()),
  updatedAt: z.string().pipe(z.coerce.date()).optional().nullable(),
});
const bookCollectionsSchema = z.object({
  collections: z.array(bookCollectionSchema),
  updatedAt: z.string().pipe(z.coerce.date()).optional().nullable(),
});

const dropboxTokenSchema = z.object({
  accessToken: z.string(),
  accountId: z.string(),
  expiresAt: z.number(),
  refreshToken: z.string(),
  scope: z.array(z.string()),
  tokenType: z.string(),
  uid: z.string(),
});

export const settingValueSchema = z.object({
  [SettingKey.ImportDataInstructionCollapsed]: z.boolean().optional().nullable(),
  [SettingKey.BookmarksToolbarPinned]: z.boolean().optional().nullable(),
  [SettingKey.BookCollection]: bookCollectionsSchema.optional().nullable(),
  [SettingKey.BookSortingPriority]: z.nativeEnum(BookSortingPriorityKey).optional().nullable(),
  [SettingKey.BookSorting]: z.nativeEnum(BookSortingKey).optional().nullable(),
  [SettingKey.BookmarkSorting]: z.nativeEnum(BookmarkSortingKey).optional().nullable(),
  [SettingKey.TextExportMode]: z.nativeEnum(TextExportMode).optional().nullable(),
  [SettingKey.MarkdownExportMode]: z.nativeEnum(MarkdownExportMode).optional().nullable(),
  [SettingKey.NotionAuth]: notionOauthResponseSchema.optional().nullable(),
  [SettingKey.NotionExportTargetPageId]: z.string().optional().nullable(),
  [SettingKey.NotionExportTo]: z.nativeEnum(NotionExportToType).optional().nullable(),
  [SettingKey.NotionExportTargetPageTitle]: z.string().optional().nullable(),
  [SettingKey.NotionExportTargetDatabaseId]: z.string().optional().nullable(),
  [SettingKey.NotionExportTargetDatabaseTitle]: z.string().optional().nullable(),
  [SettingKey.DropboxToken]: dropboxTokenSchema,
  [SettingKey.ShowRemovedBooksWhenImporting]: z.boolean().optional().nullable(),
  [SettingKey.ShowArchived]: z.boolean().optional().nullable(),
  [SettingKey.KeepLastSelectedBookCollection]: z.boolean().optional().nullable(),
  [SettingKey.LastSelectedBookCollectionId]: z.string().optional().nullable(),
  [SettingKey.Language]: z.string().optional().nullable(),
});
