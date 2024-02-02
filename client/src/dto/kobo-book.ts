export interface KoboBook {
  id: string;
  info: KoboBookInfo;
  coverImageUrl?: string;
  chapters: KoboBookChapter[];
  bookmarks: KoboBookmark[];
}

export interface KoboBookInfo {
  title?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  publisher?: string;
  isbn?: string;
  dateLastRead?: Date;
}

export interface KoboBookmark {
  id: string;
  text: string;
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
