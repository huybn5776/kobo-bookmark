import { descend, maxBy, ascend, sortWith } from 'ramda';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

export function sortKoboBooks(books: KoboBook[], sorting: BookSortingKey[]): KoboBook[] {
  const sortFns: ((a: KoboBook, b: KoboBook) => number)[][] = [
    sorting.includes(BookSortingKey.LastBookmark)
      ? [
          descend((book) => {
            const lastBookmark = book.bookmarks.reduce(maxBy((bookmark) => bookmark.createdAt));
            return lastBookmark.createdAt;
          }),
        ]
      : [],
    sorting.includes(BookSortingKey.LastUpdate) ? [descend((book) => book.info.dateLastRead ?? 0)] : [],
    sorting.includes(BookSortingKey.LastAdded) ? [descend((book) => book.info.dateAdded ?? 0)] : [],
    sorting.includes(BookSortingKey.BookName) ? [ascend((book) => book.info.title ?? '')] : [],
    sorting.includes(BookSortingKey.Author) ? [ascend((book) => book.info.author ?? '')] : [],
    sorting.includes(BookSortingKey.Series) ? [ascend((book) => book.info.series ?? '')] : [],
  ];
  return sortWith(
    sortFns.flatMap((s) => s),
    books,
  );
}

export function sortKoboBookmarks(bookmarks: KoboBookmark[], sorting: BookmarkSortingKey[]): KoboBookmark[] {
  const sortFns: ((a: KoboBookmark, b: KoboBookmark) => number)[][] = [
    sorting.includes(BookmarkSortingKey.LastUpdate) ? [descend((bookmark) => bookmark.updatedAt ?? 0)] : [],
    sorting.includes(BookmarkSortingKey.Position)
      ? [compareChapters, ascend((bookmark) => bookmark.chapterProgress)]
      : [],
  ];
  return sortWith(
    sortFns.flatMap((s) => s),
    bookmarks,
  );
}

export function createBookmarkPositionSortFn<T>(
  bookmarkGetter: (v: T) => KoboBookmark | undefined,
): (v1: T, v2: T) => number {
  const progressSortFn = ascend<KoboBookmark>((bookmark) => bookmark.chapterProgress);
  return (v1: T, v2: T) => {
    const bookmark1 = bookmarkGetter(v1);
    const bookmark2 = bookmarkGetter(v2);
    if (!bookmark1 || !bookmark2) {
      return 0;
    }
    return compareChapters(bookmark1, bookmark2) || progressSortFn(bookmark1, bookmark2);
  };
}

export function compareChapters(bookmark1: KoboBookmark, bookmark2: KoboBookmark): number {
  const chapters1 = [...(bookmark1.chapter.parentChapters || []), ...(bookmark1.chapter.relatedChapters || [])];
  const chapters2 = [...(bookmark2.chapter.parentChapters || []), ...(bookmark2.chapter.relatedChapters || [])];
  const maxChaptersLength = Math.max(chapters1.length, chapters2.length);

  for (let i = 0; i < maxChaptersLength; i += 1) {
    const chapter1 = chapters1[i];
    const chapter2 = chapters2[i];
    if (chapter1 && !chapter2) {
      return 1;
    }
    if (!chapter1 && chapter2) {
      return -1;
    }
    if (chapter1.index === chapter2.index) {
      continue;
    }
    return chapter1.index > chapter2.index ? 1 : -1;
  }

  return 0;
}
