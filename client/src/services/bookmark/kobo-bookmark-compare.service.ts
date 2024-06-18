import equal from 'fast-deep-equal';
import { indexBy, equals, prop } from 'ramda';

import { KoboBook, KoboBookmark, KoboBookChanges, KoboBookmarkChanges, KoboBookmarkChangesType } from '@/dto/kobo-book';

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
    } else if (isBookmarkUpdated(originalBookmark, bookmark)) {
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

export function isBookmarkUpdated(originalBookmark: KoboBookmark, currentBookmark: KoboBookmark): boolean {
  return (
    originalBookmark.updatedAt.getTime() !== currentBookmark.updatedAt.getTime() ||
    isBookmarkChapterUpdated(originalBookmark, currentBookmark) ||
    isBookmarkTextUpdated(originalBookmark, currentBookmark) ||
    originalBookmark.annotation !== currentBookmark.annotation
  );
}

export function updateImportedAtFromChanges(books: KoboBook[], changes: KoboBookChanges[]): KoboBook[] {
  const now = new Date();

  const bookIdMap = indexBy(prop('id'), books);
  const updatedBooks = [...books];
  for (const bookChange of changes) {
    const book = bookIdMap[bookChange.book.id];
    if (!book) {
      continue;
    }
    const updatedBook: KoboBook = { ...book };
    const bookmarkIdMap = indexBy(prop('id'), updatedBook.bookmarks);
    for (const change of bookChange.changes) {
      const bookmark = bookmarkIdMap[change.id];
      if (!bookmark) {
        continue;
      }
      const updatedBookmark = { ...bookmark };
      updatedBookmark.importedAt = now;
      updatedBook.bookmarks[updatedBook.bookmarks.indexOf(bookmark)] = updatedBookmark;
    }
    updatedBooks[updatedBooks.indexOf(book)] = updatedBook;
  }

  return updatedBooks;
}

function isBookmarkChapterUpdated(originalBookmark: KoboBookmark, currentBookmark: KoboBookmark): boolean {
  if (originalBookmark.originalChapter && !currentBookmark.originalChapter) {
    return !equals(originalBookmark.originalChapter, currentBookmark.chapter);
  }
  if (
    originalBookmark.originalChapter &&
    currentBookmark.originalChapter &&
    !equal(originalBookmark.originalChapter, currentBookmark.originalChapter)
  ) {
    return true;
  }
  return !equals(originalBookmark.chapter, currentBookmark.chapter);
}

function isBookmarkTextUpdated(originalBookmark: KoboBookmark, currentBookmark: KoboBookmark): boolean {
  if (originalBookmark.originalText && !currentBookmark.originalText) {
    return originalBookmark.originalText !== currentBookmark.text;
  }
  if (
    originalBookmark.originalText &&
    currentBookmark.originalText &&
    originalBookmark.originalText !== currentBookmark.originalText
  ) {
    return true;
  }
  return originalBookmark.text !== currentBookmark.text;
}
