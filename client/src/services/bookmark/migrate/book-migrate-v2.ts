import { KoboBook } from '@/dto/kobo-book';

export function migrateBookV2(book: KoboBook): KoboBook {
  if (book.version && book.version >= 2) {
    return book;
  }
  const updatedBook = { ...book };
  if (
    updatedBook.coverImageUrl?.startsWith('https://corsproxy.io/?') &&
    !updatedBook.coverImageUrl?.startsWith('https://corsproxy.io/?url=')
  ) {
    updatedBook.coverImageUrl = updatedBook.coverImageUrl.replace(
      'https://corsproxy.io/?',
      'https://corsproxy.io/?url=',
    );
  }
  updatedBook.version = 2;
  return updatedBook;
}
