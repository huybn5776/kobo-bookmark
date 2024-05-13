// noinspection JSDeprecatedSymbols

import { indexBy, prop } from 'ramda';

import { KoboBook, KoboBookChapter, KoboBookmark } from '@/dto/kobo-book';

export function migrateBookV1(book: KoboBook): KoboBook {
  if (book.version && book.version >= 1) {
    return book;
  }
  const updatedBook = { ...book };
  updatedBook.chapters = migrateBookChaptersV1(book.chapters);
  updatedBook.bookmarks = book.bookmarks.map((bookmark) => migrateBookmarkChapterV1(bookmark));
  updatedBook.version = 1;
  return updatedBook;
}

function migrateBookChaptersV1(chapters: KoboBookChapter[]): KoboBookChapter[] {
  const chapterIndexMap = indexBy(prop('index'), chapters);
  const resultChapters: KoboBookChapter[] = [];

  for (const chapter of chapters) {
    if (chapter.parentChapter) {
      const parentChapter = chapterIndexMap[chapter.parentChapter.index];
      parentChapter.children = parentChapter.children ? [...parentChapter.children, chapter] : [chapter];
      delete chapter.parentChapter;
    } else {
      resultChapters.push(chapter);
    }
  }

  return resultChapters;
}

function migrateBookmarkChapterV1(bookmark: KoboBookmark): KoboBookmark {
  const updatedBook = { ...bookmark };
  updatedBook.chapter = {
    relatedChapterIndexes: bookmark.chapter.relatedChapters?.map(prop('index')) || [],
    parentChapterIndexes: bookmark.chapter.parentChapters?.map(prop('index')),
  };
  if (!updatedBook.chapter.parentChapterIndexes?.length) {
    delete updatedBook.chapter.parentChapterIndexes;
  }
  return updatedBook;
}
