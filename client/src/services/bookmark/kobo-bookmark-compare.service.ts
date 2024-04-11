import equal from 'fast-deep-equal';
import { indexBy } from 'ramda';

import { KoboBook, KoboBookChanges, KoboBookmarkChanges, KoboBookmarkChangesType } from '@/dto/kobo-book';

export function calcUpdatesOfBooks(originalBooks: KoboBook[], currentBooks: KoboBook[]): KoboBookChanges[] {
  const originalBooksIndex = indexBy((book) => book.id, originalBooks);
  const currentBooksIndex = indexBy((book) => book.id, currentBooks);

  const addedAndUpdated: KoboBookChanges[] = currentBooks.flatMap((book) => {
    const originalBook = originalBooksIndex[book.id];
    if (!originalBook) {
      const changes: KoboBookmarkChanges[] = book.bookmarks.map((bookmark) => ({
        id: bookmark.id,
        type: KoboBookmarkChangesType.Added,
        current: bookmark,
      }));
      return [{ book, changes, bookFileChanged: true }];
    }
    const bookChanges = findUpdatedBookmarksOfBook(originalBook, book);
    return bookChanges ? [bookChanges] : [];
  });

  const removed: KoboBookChanges[] = originalBooks
    .filter((book) => !currentBooksIndex[book.id])
    .map((book) => {
      const changes: KoboBookmarkChanges[] = book.bookmarks.map((bookmark) => ({
        id: bookmark.id,
        type: KoboBookmarkChangesType.Removed,
        original: bookmark,
      }));
      return { book, changes, bookFileChanged: true, bookRemoved: true };
    });

  return [...addedAndUpdated, ...removed];
}

export function findUpdatedBookmarksOfBook(originalBook: KoboBook, currentBook: KoboBook): KoboBookChanges | null {
  const originalBookmarksIndex = indexBy((bookmark) => bookmark.id, originalBook.bookmarks);
  const currentBookmarksIndex = indexBy((bookmark) => bookmark.id, currentBook.bookmarks);

  const changes: KoboBookmarkChanges[] = [];
  for (const bookmark of currentBook.bookmarks) {
    const originalBookmark = originalBookmarksIndex[bookmark.id];
    if (!originalBookmark) {
      changes.push({ id: bookmark.id, type: KoboBookmarkChangesType.Added, current: bookmark });
    } else if (originalBookmark.updatedAt.getTime() !== bookmark.updatedAt.getTime()) {
      changes.push({
        id: bookmark.id,
        type: KoboBookmarkChangesType.Updated,
        original: originalBookmark,
        current: bookmark,
      });
    }
  }
  originalBook.bookmarks
    .filter((bookmark) => !currentBookmarksIndex[bookmark.id])
    .forEach((bookmark) =>
      changes.push({ id: bookmark.id, type: KoboBookmarkChangesType.Removed, original: bookmark }),
    );

  if (!changes.length) {
    return null;
  }
  return { book: currentBook, changes, bookFileChanged: !isSameBookFile(originalBook, currentBook) };
}

export function isSameBookFile(book1: KoboBook, book2: KoboBook): boolean {
  const info1 = book1.info;
  const info2 = book2.info;
  return (
    book1.id === book2.id &&
    info1.fileSize === info2.fileSize &&
    equal(info1.createdAt, info2.createdAt) &&
    equal(book1.chapters, book2.chapters)
  );
}
