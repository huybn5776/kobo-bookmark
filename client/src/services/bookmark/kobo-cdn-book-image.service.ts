import { KoboBook } from '@/dto/kobo-book';

export function getBookCoverFromKoboBookInfo(book: KoboBook): string | null {
  const { imageId } = book.info;
  if (book.info.isSideLoaded || !book.info.imageId) {
    return null;
  }
  return `https://cdn.kobo.com/book-images/${imageId}/-.jpg`;
}
