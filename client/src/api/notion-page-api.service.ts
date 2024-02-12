import type {
  SearchResponse,
  GetPageResponse,
  CreatePageResponse,
  CreatePageParameters,
  UpdatePageParameters,
  UpdatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

import axiosInstance from '@/api/notion-axios-instance';

export async function getAllPages(): Promise<SearchResponse> {
  const response = await axiosInstance.get<SearchResponse>('/api/notion/pages');
  return response.data;
}

export async function getPage(id: string): Promise<GetPageResponse> {
  const response = await axiosInstance.get<GetPageResponse>(`/api/notion/pages/${id}`);
  return response.data;
}

export async function createNotionPage(params: CreatePageParameters): Promise<CreatePageResponse> {
  const response = await axiosInstance.post<CreatePageResponse>(`/api/notion/pages`, params);
  return response.data;
}

export async function updateNotionPage(
  id: string,
  params: Omit<UpdatePageParameters, 'page_id'>,
): Promise<UpdatePageResponse> {
  const response = await axiosInstance.patch<UpdatePageResponse>(`/api/notion/pages/${id}`, params);
  return response.data;
}
