import { getCoverImageFromGoogleByIsbn, getCoverImageFromGoogleByTitleAndAuthor } from '@/api/google-book-api.service';
import { getBookCoverFromKoboByIsbn, getBookCoverFromKoboByTitleAndAuthor } from '@/api/kobo-books-api.service';
import { KoboBook } from '@/dto/kobo-book';
import { getBookCoverFromKoboBookInfo } from '@/services/bookmark/kobo-cdn-book-image.service';

export async function findCoverImageForBook(book: KoboBook): Promise<string | null> {
  const { isbn, title, author } = book.info;
  return (
    (await getBookCoverFromKoboBookInfo(book)) ||
    (isbn ? await getBookCoverFromKoboByIsbn(isbn) : null) ||
    (isbn ? await getCoverImageFromGoogleByIsbn(isbn) : null) ||
    (title && author ? await getCoverImageFromGoogleByTitleAndAuthor(title, author) : null) ||
    (title && author ? await getBookCoverFromKoboByTitleAndAuthor(title, author) : null) ||
    null
  );
}
