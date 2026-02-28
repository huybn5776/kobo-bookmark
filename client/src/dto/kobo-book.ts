import { HighlightColor } from '@/enum/highlight-color';

export interface KoboBook {
  id: string;
  info: KoboBookInfo;
  coverImageUrl?: string;
  fetchableCoverImageUrl?: string;
  chapters: KoboBookChapter[];
  bookmarks: KoboBookmark[];
  notion?: NotionExportState;
  tags?: KoboBookTag;
  version: number;
  isArchived: number;
}

export interface KoboBookInfo {
  title?: string;
  originalTitle?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  publisher?: string;
  publicationDate?: Date;
  series?: string;
  isbn?: string;
  timeSpentReading?: number;
  imageId?: string;
  isSideLoaded: boolean;
  fileSize?: number;
  lastReadAt?: Date;
  lastBookmarkAt?: Date;
  createdAt?: Date;
}

export interface KoboBookmark {
  id: string;
  text: string;
  originalText?: string;
  annotation?: string;
  chapter: KoboBookmarkChapter;
  originalChapter?: KoboBookmarkChapter;
  chapterProgress: number;
  startContainerPath: string;
  endContainerPath: string;
  color?: HighlightColor;
  tags?: KoboBookmarkTag[];
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
  importedAt?: Date;
  editedAt?: Date;
}

export interface KoboBookmarkChapter {
  relatedChapterIndexes: number[];
  parentChapterIndexes?: number[];
  /** @deprecated */
  relatedChapters?: KoboBookChapter[];
  /** @deprecated */
  parentChapters?: KoboBookChapter[];
}

export interface KoboBookChapter {
  title: string;
  index: number;
  children?: KoboBookChapter[];
  /** @deprecated */
  parentChapter?: KoboBookChapter;
}

export interface KoboBookmarkTag {
  title: string;
  createdAt: Date;
}

export interface NotionExportState {
  lastPageId?: string;
  lastDatabasePageId?: string;
}

export interface KoboBookTag {
  star?: boolean;
}

export interface KoboBookChanges {
  book: KoboBook;
  changes: KoboBookmarkChanges[];
  bookFileChanged: boolean;
  bookRemoved?: boolean;
}

export interface KoboBookmarkChanges {
  id: string;
  type: KoboBookmarkChangesType;
  original?: KoboBookmark;
  current?: KoboBookmark;
}

export enum KoboBookmarkChangesType {
  Added = 'added',
  Updated = 'updated',
  Removed = 'removed',
}

export interface ImageUrlSet {
  url: string;
  fetchableUrl?: string;
}
