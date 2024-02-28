export interface KoboBook {
  id: string;
  info: KoboBookInfo;
  coverImageUrl?: string;
  chapters: KoboBookChapter[];
  bookmarks: KoboBookmark[];
  notion?: NotionExportState;
}

export interface KoboBookInfo {
  title?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  publisher?: string;
  series?: string;
  isbn?: string;
  imageId?: string;
  isSideLoaded: boolean;
  dateLastRead?: Date;
  dateAdded?: Date;
}

export interface KoboBookmark {
  id: string;
  text: string;
  annotation?: string;
  chapter: KoboBookmarkChapter;
  chapterProgress: number;
  createdAt: Date;
  updatedAt: Date;
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
