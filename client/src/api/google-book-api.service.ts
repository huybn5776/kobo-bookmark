import axios from 'axios';
import type { books_v1 } from 'googleapis';
import { sortBy } from 'ramda';

export type GoogleBook = books_v1.Schema$Volume;

export async function getCoverImageFromGoogleByIsbn(isbn: string): Promise<string | null> {
  const googleBooks = await queryGoogleBooks(`q=isbn:${isbn}`);
  const firstBookResult = googleBooks?.[0];
  return firstBookResult ? getCoverImageUrlFromGoogleBook(firstBookResult) : null;
}

export async function getCoverImageFromGoogleByTitleAndAuthor(title: string, author: string): Promise<string | null> {
  const googleBooks = await queryGoogleBooks(`q=intitle:${title}&inauthor:${author}`);
  const prefix = title.substring(0, 2);
  const sortedBooks = sortBy((b) => !b.volumeInfo?.title?.startsWith(prefix), googleBooks);
  return sortedBooks.map(getCoverImageUrlFromGoogleBook).find((url) => !!url) || null;
}

function getCoverImageUrlFromGoogleBook(book: GoogleBook): string | null {
  const thumbnail = book.volumeInfo?.imageLinks?.thumbnail;
  if (!thumbnail || !thumbnail.startsWith('http://')) {
    return null;
  }
  const url = new URL(thumbnail);
  if (url.searchParams.has('zoom')) {
    url.searchParams.set('zoom', '2');
  }
  url.searchParams.delete('edge');
  url.protocol = 'https:';
  return url.toString();
}

async function queryGoogleBooks(paramsString: string): Promise<GoogleBook[]> {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?${paramsString}`;
  const response = await axios.get<{ items?: books_v1.Schema$Volume[] }>(apiUrl);
  return response.data.items || [];
}
