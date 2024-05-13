import { KoboBook } from '@/dto/kobo-book';
import { migrateBookV1 } from '@/services/bookmark/migrate/book-migrate-v1';

export function migrateBooksIfNeeds(books: KoboBook[]): KoboBook[] {
  return books.map(migrateBookIfNeeds);
}

export function migrateBookIfNeeds(book: KoboBook): KoboBook {
  let updatedBook = book;
  updatedBook = migrateBookV1(updatedBook);
  return updatedBook;
}
