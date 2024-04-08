import { openDB, deleteDB, DBSchema, IDBPDatabase } from 'idb';

import { KoboBook } from '@/dto/kobo-book';

const dbName = 'book-db';
const booksStore = 'books-store';

interface BookDb extends DBSchema {
  [booksStore]: { key: string; value: KoboBook };
}

export async function getAllBooksFromDb(): Promise<KoboBook[]> {
  const db = await getDbInstance();
  return db.getAll(booksStore);
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

export async function deleteBooksInDb(ids: string[]): Promise<void> {
  const db = await getDbInstance();
  const tx = db.transaction(booksStore, 'readwrite');
  const store = tx.objectStore(booksStore);
  await Promise.all(ids.map((id) => store.delete(id)));
  await tx.done;
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
  database.createObjectStore(booksStore, { keyPath: 'id' });
}

let dbInstance: IDBPDatabase<BookDb> | undefined;

async function getDbInstance(): Promise<IDBPDatabase<BookDb>> {
  if (!dbInstance) {
    dbInstance = await openDb();
  }
  return dbInstance;
}
