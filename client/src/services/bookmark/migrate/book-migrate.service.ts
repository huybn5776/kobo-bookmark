import { KoboBook } from '@/dto/kobo-book';
import { migrateBookV2 } from '@/services/bookmark/migrate/book-migrate-v2';

export function migrateBooksIfNeeds(books: KoboBook[]): KoboBook[] {
  return books.map(migrateBookIfNeeds);
}

export function migrateBookIfNeeds(book: KoboBook): KoboBook {
  let updatedBook = book;
  updatedBook = migrateBookV2(updatedBook);
  return updatedBook;
}
