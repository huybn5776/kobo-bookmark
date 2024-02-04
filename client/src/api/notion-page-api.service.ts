import type { SearchResponse } from '@notionhq/client/build/src/api-endpoints';

import axiosInstance from '@/api/notion-axios-instance';

export async function getAllPages(): Promise<SearchResponse> {
  const response = await axiosInstance.get<SearchResponse>('/api/notion/pages');
  return response.data;
}
