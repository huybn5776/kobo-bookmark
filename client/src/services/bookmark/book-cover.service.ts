import * as E from 'fp-ts/Either';

import { getCoverImageFromGoogleByIsbn, getCoverImageFromGoogleByTitleAndAuthor } from '@/api/google-book-api.service';
import { getBookCoverFromKoboByIsbn, getBookCoverFromKoboByTitleAndAuthor } from '@/api/kobo-books-api.service';
import { KoboBook } from '@/dto/kobo-book';
import { getBookCoverFromKoboBookInfo } from '@/services/bookmark/kobo-cdn-book-image.service';
import { tryParseUrl } from '@/util/url-utils';

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

export async function processImageUrl(url: string): Promise<E.Either<string, string>> {
  if (!tryParseUrl(url)) {
    return E.left('common.invalid_url_format');
  }
  const response = await tryFetchUrl(url);
  if (!response?.ok) {
    return E.left('common.cannot_get_response_from_url');
  }

  const contentType = response.headers?.get('content-type');
  if (!contentType?.startsWith('image/')) {
    return E.left('page.bookmarks.not_image_url');
  }
  return E.right(response.url);
}

async function tryFetchUrl(url: string): Promise<Response | null> {
  let response: Response | null = null;
  try {
    response = await fetch(url);
  } catch (_) {
    // ignored
  }

  if (response?.ok) {
    return response;
  }
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  try {
    response = await fetch(proxyUrl);
  } catch (_) {
    return null;
  }
  if (response.ok) {
    return response;
  }
  return null;
}
