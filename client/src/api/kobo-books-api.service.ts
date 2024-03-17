import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { KoboBooksSearchResult } from '@/dto/kobo-book-search';

const rakutenApplicationId = import.meta.env.VITE_RAKUTEN_APPLICATION_ID;

const http = rateLimit(axios.create(), { maxRPS: 1 });

export async function getBookCoverFromKoboByIsbn(isbn: string): Promise<string | null> {
  const result = await queryBooks({ itemNumber: isbn });
  const koboBookItems = result.Items.map((items) => items.Item);
  return koboBookItems[0]?.largeImageUrl;
}

export async function getBookCoverFromKoboByTitleAndAuthor(title: string, author: string): Promise<string | null> {
  const result = await queryBooks({ title, author });
  const koboBookItems = result.Items.map((items) => items.Item);
  return koboBookItems[0]?.largeImageUrl;
}

async function queryBooks(params: Record<string, string | number>): Promise<KoboBooksSearchResult> {
  const response = await http.get<KoboBooksSearchResult>(
    'https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426',
    { params: { applicationId: rakutenApplicationId, ...params } },
  );
  return response.data;
}
