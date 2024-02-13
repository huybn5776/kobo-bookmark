import type {
  BlockObjectRequest,
  AppendBlockChildrenResponse,
  ListBlockChildrenResponse,
  DeleteBlockResponse,
  GetBlockResponse,
} from '@notionhq/client/build/src/api-endpoints';

import axiosInstance from '@/api/notion-axios-instance';

export async function getBlock(blockId: string): Promise<GetBlockResponse> {
  const response = await axiosInstance.post<GetBlockResponse>(`/api/notion/blocks/${blockId}`);
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

export async function deleteBlock(id: string): Promise<DeleteBlockResponse> {
  const response = await axiosInstance.delete<DeleteBlockResponse>(`/api/notion/blocks/${id}`);
  return response.data;
}

export async function deleteBlocks(blockIds: string[]): Promise<DeleteBlockResponse[]> {
  const response = await axiosInstance.post<DeleteBlockResponse[]>(`/api/notion/blocks/$deleteMulti`, blockIds);
  return response.data;
}
