import type {
  SearchResponse,
  GetDatabaseResponse,
  QueryDatabaseResponse,
  DatabaseObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import axiosInstance from '@/api/notion-axios-instance';

export async function searchDatabase(
  title?: string,
): Promise<Omit<SearchResponse, 'results'> & { results: DatabaseObjectResponse[] }> {
  return (await axiosInstance.get(`/api/notion/databases`, { params: { title } })).data;
}

export async function getDatabase(id: string): Promise<GetDatabaseResponse> {
  return (await axiosInstance.get(`/api/notion/databases/${id}`)).data;
}

export async function queryDatabaseWithBookId(id: string, bookId: string): Promise<QueryDatabaseResponse> {
  return (await axiosInstance.get(`/api/notion/databases/${id}/query`, { params: { bookId } })).data;
}
