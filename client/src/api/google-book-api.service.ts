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
  const url = book.volumeInfo?.imageLinks?.thumbnail;
  return url && url.startsWith('http://') ? `https${url.substring(4)}` : url || null;
}

async function queryGoogleBooks(paramsString: string): Promise<GoogleBook[]> {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?${paramsString}`;
  const response = await axios.get<{ items?: books_v1.Schema$Volume[] }>(apiUrl);
  return response.data.items || [];
}
