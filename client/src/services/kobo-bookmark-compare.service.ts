import { indexBy } from 'ramda';

import { KoboBook, KoboBookChanges, KoboBookmarkChanges, KoboBookmarkChangesType } from '@/dto/kobo-book';

export function calcUpdatesOfBooks(originalBooks: KoboBook[], currentBooks: KoboBook[]): KoboBookChanges[] {
  const originalBooksIndex = indexBy((book) => book.id, originalBooks);
  const currentBooksIndex = indexBy((book) => book.id, currentBooks);

  const addedAndUpdated = currentBooks.flatMap((book) => {
    const originalBook = originalBooksIndex[book.id];
    if (!originalBook) {
      const changes: KoboBookmarkChanges[] = book.bookmarks.map((bookmark) => ({
        id: bookmark.id,
        type: KoboBookmarkChangesType.Added,
        current: bookmark,
      }));
      return [{ book, changes }];
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
      return { book, changes };
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
  return { originalBook, book: currentBook, changes };
}
