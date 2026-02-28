import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { KoboBooksSearchResult } from '@/dto/kobo-book-search';

const rakutenApplicationId = import.meta.env.VITE_RAKUTEN_APPLICATION_ID as string;
const rakutenOpenapiApplicationId = import.meta.env.VITE_RAKUTEN_OPENAPI_APPLICATION_ID as string;
const rakutenOpenapiAccessKey = import.meta.env.VITE_RAKUTEN_OPENAPI_ACCESS_KEY as string;

const http = rateLimit(axios.create(), { maxRPS: 1 });

export async function getBookCoverFromKoboByIsbn(isbn: string): Promise<string | null> {
  return (
    getLargeImageUrl(await queryBooks({ itemNumber: isbn })) ??
    getLargeImageUrl(await queryBooksByOpenApi({ itemNumber: isbn })) ??
    null
  );
}

export async function getBookCoverFromKoboByTitleAndAuthor(title: string, author: string): Promise<string | null> {
  return (
    getLargeImageUrl(await queryBooks({ title, author })) ??
    getLargeImageUrl(await queryBooksByOpenApi({ title, author })) ??
    null
  );
}

async function queryBooks(params: Record<string, string | number>): Promise<KoboBooksSearchResult | null> {
  const response = await http.get<KoboBooksSearchResult>(
    'https://app.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426',
    {
      params: { applicationId: rakutenApplicationId, ...params },
      validateStatus: () => true,
    },
  );
  return response.status === 200 ? response.data : null;
}

async function queryBooksByOpenApi(params: Record<string, string | number>): Promise<KoboBooksSearchResult | null> {
  const response = await http.get<KoboBooksSearchResult>(
    'https://openapi.rakuten.co.jp/services/api/Kobo/EbookSearch/20170426',
    {
      params: { applicationId: rakutenOpenapiApplicationId, accessKey: rakutenOpenapiAccessKey, ...params },
      validateStatus: () => true,
    },
  );
  return response.status === 200 ? response.data : null;
}

function getLargeImageUrl(result: KoboBooksSearchResult | null): string | undefined {
  const koboBookItems = result?.Items.map((items) => items.Item);
  return koboBookItems?.[0]?.largeImageUrl;
}
