import { z } from 'zod';

import { HighlightColor } from '@/enum/highlight-color';

export const koboBookInfoSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  timeSpentReading: z.number().optional().nullable(),
  imageId: z.string().optional().nullable(),
  isSideLoaded: z.boolean(),
  fileSize: z.number().optional().nullable(),
  lastReadAt: z.string().pipe(z.coerce.date()).optional().nullable(),
  lastBookmarkAt: z.string().pipe(z.coerce.date()).optional().nullable(),
  createdAt: z.string().pipe(z.coerce.date()).optional().nullable(),
});

export const koboBookChapterSchema: z.ZodSchema<unknown> = z.lazy(() =>
  z.object({
    title: z.string(),
    index: z.number(),
    parentChapter: koboBookChapterSchema.optional().nullable(),
  }),
);

export const notionExportStateSchema = z.object({
  lastPageId: z.string().optional().nullable(),
  lastDatabasePageId: z.string().optional().nullable(),
});

export const koboBookmarkChapterSchema = z.object({
  titles: z.array(z.string()),
  relatedChapters: z.array(koboBookChapterSchema),
  parentChapters: z.array(koboBookChapterSchema),
});

export const koboBookmarkSchema = z.object({
  id: z.string(),
  text: z.string(),
  annotation: z.string().optional().nullable(),
  chapter: koboBookmarkChapterSchema,
  chapterProgress: z.number(),
  startContainerPath: z.string(),
  endContainerPath: z.string(),
  color: z.nativeEnum(HighlightColor).optional().nullable(),
  createdAt: z.string().pipe(z.coerce.date()),
  updatedAt: z.string().pipe(z.coerce.date()),
});

export const koboBookSchema = z.object({
  id: z.string(),
  info: koboBookInfoSchema,
  coverImageUrl: z.string().optional().nullable(),
  chapters: z.array(koboBookChapterSchema),
  bookmarks: z.array(koboBookmarkSchema),
  notion: notionExportStateSchema.optional().nullable(),
});
