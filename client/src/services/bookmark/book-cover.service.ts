import * as E from 'fp-ts/Either';

import { getCoverImageFromGoogleByIsbn, getCoverImageFromGoogleByTitleAndAuthor } from '@/api/google-book-api.service';
import { getBookCoverFromKoboByIsbn, getBookCoverFromKoboByTitleAndAuthor } from '@/api/kobo-books-api.service';
import { KoboBook, ImageUrlSet } from '@/dto/kobo-book';
import { getBookCoverFromKoboBookInfo } from '@/services/bookmark/kobo-cdn-book-image.service';
import { tryParseUrl } from '@/util/url-utils';

export async function findCoverImageForBook(book: KoboBook): Promise<ImageUrlSet | null> {
  const { isbn, title, author } = book.info;
  return (
    (await confirmImage(getBookCoverFromKoboBookInfo(book))) ??
    (isbn ? await getBookCoverFromKoboByIsbn(isbn).then(confirmImage) : null) ??
    (isbn ? await getCoverImageFromGoogleByIsbn(isbn).then(confirmImage) : null) ??
    (title && author ? await getCoverImageFromGoogleByTitleAndAuthor(title, author).then(confirmImage) : null) ??
    (title && author ? await getBookCoverFromKoboByTitleAndAuthor(title, author).then(confirmImage) : null) ??
    null
  );
}

export async function processImageUrl(url: string | null): Promise<E.Either<string, ImageUrlSet>> {
  if (!url || !tryParseUrl(url)) {
    return E.left('common.invalid_url_format');
  }
  const isImageUrlLoadable = await tryLoadImageUrl(url);
  if (!isImageUrlLoadable) {
    return E.left('common.cannot_get_response_from_url');
  }

  const fetchableUrl = mapToFetchableUrl(url);
  if (!fetchableUrl) {
    return E.right({ url });
  }
  const response = await tryFetchUrl(fetchableUrl);
  if (isValidImageUrlResponse(response)) {
    return E.right({ url, fetchableUrl });
  }
  return E.right({ url });
}

export async function confirmImage(url: string | null): Promise<ImageUrlSet | null> {
  if (!url) {
    return null;
  }
  const isImageUrlLoadable = await tryLoadImageUrl(url);
  if (!isImageUrlLoadable) {
    return null;
  }

  const fetchableUrl = mapToFetchableUrl(url);
  if (!fetchableUrl) {
    return { url };
  }
  const response = await tryFetchUrl(fetchableUrl);
  if (isValidImageUrlResponse(response)) {
    return { url, fetchableUrl };
  }

  return { url };
}

export function mapToFetchableUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  if (url.startsWith('https://kobo-bookmark.vercel.app/')) {
    return url;
  }

  // relate to routes settings in vercel.json
  if (url.startsWith('https://cdn.kobo.com/book-images/')) {
    const path = url.replace('https://cdn.kobo.com/book-images/', '');
    return `/kobo-book-images/${path}`;
  }
  if (url.startsWith('https://thumbnail.image.rakuten.co.jp/')) {
    const path = url.replace('https://thumbnail.image.rakuten.co.jp/', '');
    return `/rakuten-image/${path}`;
  }
  if (url.startsWith('https://books.google.com/books/content')) {
    const path = url.replace('https://books.google.com/books/', '');
    return `/google-books/${path}`;
  }

  return null;
}

export async function tryFetchUrl(url: string): Promise<Response | null> {
  try {
    return await fetch(url);
  } catch (_) {
    // ignored
    return null;
  }
}

export function tryLoadImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export function isValidImageUrlResponse(response: Response | null): boolean {
  return (response?.ok && response.headers.get('content-type')?.startsWith('image/')) ?? false;
}
