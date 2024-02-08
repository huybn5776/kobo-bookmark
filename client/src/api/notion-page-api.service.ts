import type {
  BlockObjectRequest,
  SearchResponse,
  GetPageResponse,
  CreatePageResponse,
  CreatePageParameters,
  AppendBlockChildrenResponse,
  ListBlockChildrenResponse,
  DeleteBlockResponse,
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

export async function appendNotionBlocks(
  blockId: string,
  blocks: BlockObjectRequest[],
): Promise<AppendBlockChildrenResponse> {
  const response = await axiosInstance.post<AppendBlockChildrenResponse>(`/api/notion/pages/${blockId}/blocks`, blocks);
  return response.data;
}

export async function getBlockChildren(pageOrBlockId: string, cursor?: string): Promise<ListBlockChildrenResponse> {
  const response = await axiosInstance.get<ListBlockChildrenResponse>(`/api/notion/pages/${pageOrBlockId}/blocks`, {
    params: { cursor },
  });
  return response.data;
}

export async function deleteBlocks(blockIds: string[]): Promise<DeleteBlockResponse[]> {
  const response = await axiosInstance.post<DeleteBlockResponse[]>(`/api/notion/blocks/$deleteMulti`, blockIds);
  return response.data;
}
