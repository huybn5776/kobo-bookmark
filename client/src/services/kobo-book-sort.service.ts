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
      ? [
          ascend((bookmark) => bookmark.chapter.relatedChapters[0].index),
          ascend((bookmark) => bookmark.chapterProgress),
        ]
      : [],
  ];
  return sortWith(
    sortFns.flatMap((s) => s),
    bookmarks,
  );
}
