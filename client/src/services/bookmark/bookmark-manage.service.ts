import { openDB, deleteDB, DBSchema, IDBPDatabase, StoreNames, IDBPCursorWithValue } from 'idb';
import { indexBy } from 'ramda';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
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
  return db.getAll(booksStore);
}

export async function getNotArchivedBooksFromDb(): Promise<KoboBook[]> {
  const db = await getDbInstance();
  const index = db.transaction(booksStore, 'readonly').objectStore(booksStore).index('isArchived');
  const cursor = await index.openCursor(IDBKeyRange.only(0));
  return readAllFromCursor(cursor);
}

export async function countAllBooksFromDb(): Promise<number> {
  const db = await getDbInstance();
  return db.count(booksStore);
}

export async function getBooksByIdFromDb(ids: string[]): Promise<KoboBook[]> {
  const db = await getDbInstance();
  const books = await Promise.all(ids.map((id) => db.get(booksStore, id)));
  return books.filter((book) => !!book) as KoboBook[];
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
  const updatedBook: KoboBook = {
    ...originalBook,
    ...book,
    bookmarks,
    isArchived: bookmarksChanged ? 0 : originalBook.isArchived || 0,
  };

  await putBooksToDb([updatedBook]);
}

function updateExistingBookmark(originalBookmark: KoboBookmark, currentBookmark: KoboBookmark): KoboBookmark {
  const updatedBookmark: KoboBookmark = { ...originalBookmark, ...currentBookmark };
  if (originalBookmark.updatedAt !== currentBookmark.updatedAt && updatedBookmark.isArchived) {
    updatedBookmark.isArchived = false;
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
