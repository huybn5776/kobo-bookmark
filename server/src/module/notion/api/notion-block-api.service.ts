import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { Client, UnknownHTTPResponseError } from '@notionhq/client';
import {
  AppendBlockChildrenResponse,
  BlockObjectRequest,
  UpdateBlockParameters,
  UpdateBlockResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  DeleteBlockResponse,
  PartialBlockObjectResponse,
  BlockObjectResponse,
  GetBlockResponse,
} from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionBlockApiService {
  constructor(private readonly notion: Client) {}

  async getBlock(id: string): Promise<GetBlockResponse> {
    try {
      return await this.notion.blocks.retrieve({ block_id: id });
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async appendBlock(parentId: string, blocks: BlockObjectRequest[]): Promise<AppendBlockChildrenResponse> {
    try {
      return await this.notion.blocks.children.append({ block_id: parentId, children: blocks });
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async updateBlock(id: string, params: Omit<UpdateBlockParameters, 'block_id'>): Promise<UpdateBlockResponse> {
    try {
      return await this.notion.blocks.update({ block_id: id, ...params });
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async getBlockChildren(params: ListBlockChildrenParameters): Promise<ListBlockChildrenResponse> {
    try {
      return await this.notion.blocks.children.list(params);
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async getAllBlockChildren(id: string): Promise<(PartialBlockObjectResponse | BlockObjectResponse)[]> {
    let cursor: string | undefined;
    cursor = undefined;
    const allBlocks: (PartialBlockObjectResponse | BlockObjectResponse)[] = [];

    do {
      const result = await this.getBlockChildren({ block_id: id, start_cursor: cursor });
      allBlocks.push(...result.results);
      cursor = result.next_cursor || undefined;
    } while (cursor);

    return allBlocks;
  }

  async deleteBlock(id: string): Promise<DeleteBlockResponse> {
    try {
      return await this.notion.blocks.delete({ block_id: id });
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async deleteBlocks(blockIds: string[]): Promise<DeleteBlockResponse[]> {
    try {
      const responses: DeleteBlockResponse[] = [];
      for (const blockId of blockIds) {
        const response = await this.notion.blocks.delete({ block_id: blockId });
        responses.push(response);
      }
      return responses;
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async deleteAllChildBlocks(id: string): Promise<DeleteBlockResponse[]> {
    const children = await this.getAllBlockChildren(id);
    const blockIds = children.map((block) => block.id);
    return this.deleteBlocks(blockIds);
  }

  private apiErrorToException(e: Error): HttpException {
    const error = e as UnknownHTTPResponseError;
    const body = JSON.parse(error.body);
    return new BadRequestException(body.message);
  }
}
