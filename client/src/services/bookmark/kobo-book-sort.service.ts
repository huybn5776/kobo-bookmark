import { descend, ascend, sortWith, isNotNil, isNil } from 'ramda';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

export function sortKoboBooks(books: KoboBook[], sorting: BookSortingKey[]): KoboBook[] {
  const sortFns: ((a: KoboBook, b: KoboBook) => number)[][] = [
    sorting.includes(BookSortingKey.LastBookmark) ? [descend((book) => book.info.lastBookmarkAt ?? 0)] : [],
    sorting.includes(BookSortingKey.LastUpdate) ? [descend((book) => book.info.lastReadAt ?? 0)] : [],
    sorting.includes(BookSortingKey.LastAdded) ? [descend((book) => book.info.createdAt ?? 0)] : [],
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
  const chapterIndexes1 = [
    ...(bookmark1.chapter.parentChapterIndexes || []),
    ...(bookmark1.chapter.relatedChapterIndexes || []),
  ];
  const chapterIndexes2 = [
    ...(bookmark2.chapter.parentChapterIndexes || []),
    ...(bookmark2.chapter.relatedChapterIndexes || []),
  ];
  const maxChaptersLength = Math.max(chapterIndexes1.length, chapterIndexes2.length);

  for (let i = 0; i < maxChaptersLength; i += 1) {
    const chapterIndex1 = chapterIndexes1[i];
    const chapterIndex2 = chapterIndexes2[i];
    if (isNotNil(chapterIndex1) && isNil(chapterIndex2)) {
      return 1;
    }
    if (isNil(chapterIndex1) && isNotNil(chapterIndex2)) {
      return -1;
    }
    if (chapterIndex1 === chapterIndex2) {
      continue;
    }
    return chapterIndex1 > chapterIndex2 ? 1 : -1;
  }

  return 0;
}
