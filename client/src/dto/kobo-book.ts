import { HighlightColor } from '@/enum/highlight-color';

export interface KoboBook {
  id: string;
  info: KoboBookInfo;
  coverImageUrl?: string;
  chapters: KoboBookChapter[];
  bookmarks: KoboBookmark[];
  notion?: NotionExportState;
  isArchived: number;
}

export interface KoboBookInfo {
  title?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  publisher?: string;
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
  chapterProgress: number;
  startContainerPath: string;
  endContainerPath: string;
  color?: HighlightColor;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
  editedAt?: Date;
}

export interface KoboBookmarkChapter {
  titles: string[];
  relatedChapters: KoboBookChapter[];
  parentChapters: KoboBookChapter[];
}

export interface KoboBookChapter {
  title: string;
  index: number;
  parentChapter?: KoboBookChapter;
}

export interface NotionExportState {
  lastPageId?: string;
  lastDatabasePageId?: string;
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
