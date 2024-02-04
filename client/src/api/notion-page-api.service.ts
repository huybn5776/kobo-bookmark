import type {
  BlockObjectRequest,
  SearchResponse,
  CreatePageResponse,
  CreatePageParameters,
  AppendBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';

import axiosInstance from '@/api/notion-axios-instance';

export async function getAllPages(): Promise<SearchResponse> {
  const response = await axiosInstance.get<SearchResponse>('/api/notion/pages');
  return response.data;
}

export async function createNotionPage(params: CreatePageParameters): Promise<CreatePageResponse> {
  const response = await axiosInstance.post<CreatePageResponse>(`/api/notion/pages`, params);
  return response.data;
}

export async function appendNotionBlocks(
  blockId: string,
  blocks: BlockObjectRequest[],
): Promise<AppendBlockChildrenResponse> {
  const response = await axiosInstance.post<AppendBlockChildrenResponse>(`/api/notion/pages/${blockId}/blocks`, blocks);
  return response.data;
}
