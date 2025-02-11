import equal from 'fast-deep-equal';
import { openDB, deleteDB, DBSchema, IDBPDatabase, StoreNames, IDBPCursorWithValue } from 'idb';
import { indexBy } from 'ramda';

import { KoboBook, KoboBookmark, KoboBookInfo } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import { isBookmarkUpdated } from '@/services/bookmark/kobo-bookmark-compare.service';
import { migrateBooksIfNeeds } from '@/services/bookmark/migrate/book-migrate.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { deepToRaw } from '@/util/vue-utils';

const dbName = 'book-db';
const booksStore = 'books-store';

interface BookDb extends DBSchema {
  [booksStore]: { key: string; value: KoboBook; indexes: { isArchived: number } };
}

export async function getBooksFromDb(): Promise<KoboBook[]> {
  return getSettingFromStorage(SettingKey.ShowArchived) ? getAllBooksFromDb() : getNotArchivedBooksFromDb();
}

export async function getAllBooksFromDb(): Promise<KoboBook[]> {
  const db = await getDbInstance();
  const books = await db.getAll(booksStore);
  return migrateBooksIfNeeds(books);
}

export async function getNotArchivedBooksFromDb(): Promise<KoboBook[]> {
  const db = await getDbInstance();
  const index = db.transaction(booksStore, 'readonly').objectStore(booksStore).index('isArchived');
  const cursor = await index.openCursor(IDBKeyRange.only(0));
  let books = await readAllFromCursor(cursor);
  books = migrateBooksIfNeeds(books);
  return books;
}

export async function countAllBooksFromDb(): Promise<number> {
  const db = await getDbInstance();
  return db.count(booksStore);
}

export async function getBooksByIdFromDb(ids: string[]): Promise<KoboBook[]> {
  const db = await getDbInstance();
  const books = await Promise.all(ids.map((id) => db.get(booksStore, id)));
  return books.filter((book) => !!book);
}

export async function putBooksToDb(books: KoboBook[]): Promise<void> {
  const db = await getDbInstance();
  const tx = db.transaction(booksStore, 'readwrite');
  const store = tx.objectStore(booksStore);
  await Promise.all(books.map((book) => store.put(book)));
  await tx.done;
}

export async function upsertBook(book: KoboBook): Promise<void> {
  const originalBook = (await getBooksByIdFromDb([book.id]))[0];
  if (!originalBook) {
    await putBooksToDb([book]);
    return;
  }

  const originalBookmarksIndex = indexBy((b) => b.id, originalBook.bookmarks);
  const bookmarks = book.bookmarks.map((bookmark) => {
    const originalBookmark = originalBookmarksIndex[bookmark.id];
    return originalBookmark ? updateExistingBookmark(originalBookmark, bookmark) : bookmark;
  });
  const bookmarksChanged = JSON.stringify(originalBook.bookmarks) !== JSON.stringify(bookmarks);
  const info: KoboBookInfo = mergeBookInfo(originalBook.info, book.info);
  const updatedBook: KoboBook = {
    ...originalBook,
    ...book,
    info,
    bookmarks,
    isArchived: bookmarksChanged ? 0 : originalBook.isArchived || 0,
  };

  await putBooksToDb([updatedBook]);
}

export function updateBookTitle(book: KoboBook, title: string): KoboBook {
  if (title === book.info.title) {
    return book;
  }
  const updatedBook: KoboBook = { ...book };
  const updatedBookInfo: KoboBookInfo = { ...book.info };
  const originalTitle = updatedBookInfo.originalTitle || updatedBookInfo.title;
  updatedBookInfo.title = title;
  if (updatedBookInfo.title === updatedBookInfo.originalTitle) {
    delete updatedBookInfo.originalTitle;
  } else {
    updatedBookInfo.originalTitle = originalTitle;
  }
  updatedBook.info = updatedBookInfo;
  return updatedBook;
}

function mergeBookInfo(originalInfo: KoboBookInfo, currentInfo: KoboBookInfo): KoboBookInfo {
  const updatedInfo: KoboBookInfo = { ...originalInfo, ...currentInfo };
  if (originalInfo.originalTitle && !currentInfo.originalTitle) {
    if (originalInfo.originalTitle === currentInfo.title) {
      updatedInfo.title = originalInfo.title;
    } else {
      updatedInfo.title = currentInfo.title;
      delete updatedInfo.originalTitle;
    }
  }
  return updatedInfo;
}

function updateExistingBookmark(originalBookmark: KoboBookmark, currentBookmark: KoboBookmark): KoboBookmark {
  if (!isBookmarkUpdated(originalBookmark, currentBookmark)) {
    return originalBookmark;
  }

  const updatedBookmark: KoboBookmark = { ...originalBookmark, ...currentBookmark };
  if (updatedBookmark.isArchived) {
    updatedBookmark.isArchived = false;
  }
  if (originalBookmark.originalChapter && !currentBookmark.originalChapter) {
    updatedBookmark.chapter = originalBookmark.chapter;
  }
  if (originalBookmark.originalText && !currentBookmark.originalText) {
    if (originalBookmark.originalText === currentBookmark.text) {
      updatedBookmark.text = originalBookmark.text;
    } else {
      updatedBookmark.text = currentBookmark.text;
      delete updatedBookmark.originalText;
    }
  }
  if (!currentBookmark.annotation && originalBookmark.annotation) {
    delete updatedBookmark.annotation;
  }

  return updatedBookmark;
}

export async function archiveBooksInDb(bookIds: string[]): Promise<void> {
  const books = await getBooksByIdFromDb(bookIds);
  const updatedBooks = books.map((book) => ({ ...book, isArchived: 1 }));
  return putBooksToDb(updatedBooks);
}

export async function cancelArchiveBooksInDb(bookIds: string[]): Promise<void> {
  const books = await getBooksByIdFromDb(bookIds);
  const updatedBooks = books.map((book) => ({ ...book, isArchived: 0 }));
  return putBooksToDb(updatedBooks);
}

export async function deleteBooksInDb(ids: string[]): Promise<void> {
  const db = await getDbInstance();
  const tx = db.transaction(booksStore, 'readwrite');
  const store = tx.objectStore(booksStore);
  await Promise.all(ids.map((id) => store.delete(id)));
  await tx.done;
}

export async function updateBookmark(
  bookId: string,
  bookmarkId: string,
  updater: (bookmark: KoboBookmark) => KoboBookmark,
): Promise<boolean> {
  const book = (await getBooksByIdFromDb([bookId]))[0];
  if (!book) {
    return false;
  }
  const targetBookmarkIndex = book?.bookmarks.findIndex((bookmark) => bookmark.id === bookmarkId);
  if (targetBookmarkIndex === -1) {
    return false;
  }
  const updatedBookmarks = [...book.bookmarks];
  updatedBookmarks[targetBookmarkIndex] = updater(book.bookmarks[targetBookmarkIndex]);
  const updatedBook = { ...book, bookmarks: updatedBookmarks };
  await putBooksToDb([deepToRaw(updatedBook)]);

  return true;
}

export async function deleteBookTable(): Promise<void> {
  (await getDbInstance()).close();
  dbInstance = undefined;
  return deleteDB(dbName);
}

export function updateBookmarkByPatch(bookmark: KoboBookmark, patch: Partial<KoboBookmark>): KoboBookmark {
  if (!Object.keys(patch).length) {
    return bookmark;
  }

  const updatedBookmark = { ...bookmark };
  Object.assign(updatedBookmark, patch);
  if (equal(bookmark.originalChapter, updatedBookmark.chapter)) {
    delete updatedBookmark.originalChapter;
  } else if (!bookmark.originalChapter && patch.chapter) {
    updatedBookmark.originalChapter = bookmark.chapter;
  }
  if (bookmark.originalText === updatedBookmark.text) {
    delete updatedBookmark.originalText;
  } else if (!bookmark.originalText && patch.text) {
    updatedBookmark.originalText = bookmark.text;
  }
  updatedBookmark.editedAt = new Date();
  return updatedBookmark;
}

function openDb(): Promise<IDBPDatabase<BookDb>> {
  return openDB<BookDb>(dbName, 1, { upgrade });
}

function upgrade(database: IDBPDatabase<BookDb>): void {
  const store = database.createObjectStore(booksStore, { keyPath: 'id' });
  store.createIndex('isArchived', 'isArchived', { unique: false });
}

let dbInstance: IDBPDatabase<BookDb> | undefined;

async function getDbInstance(): Promise<IDBPDatabase<BookDb>> {
  if (!dbInstance) {
    dbInstance = await openDb();
  }
  return dbInstance;
}

async function readAllFromCursor(
  cursor: IDBPCursorWithValue<BookDb, [StoreNames<BookDb>], typeof booksStore> | null,
): Promise<KoboBook[]> {
  const books: KoboBook[] = [];
  let currentCursor = cursor;
  while (currentCursor) {
    books.push(currentCursor.value);
    currentCursor = await currentCursor.continue();
  }
  return books;
}
