import type {
  SearchResponse,
  PartialDatabaseObjectResponse,
  GetDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

import axiosInstance from '@/api/notion-axios-instance';

export async function searchDatabase(
  title?: string,
): Promise<Omit<SearchResponse, 'results'> & { results: PartialDatabaseObjectResponse[] }> {
  return (await axiosInstance.get(`/api/notion/databases`, { params: { title } })).data;
}

export async function getDatabase(id: string): Promise<GetDatabaseResponse> {
  return (await axiosInstance.get(`/api/notion/databases/${id}`)).data;
}
