import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { Client, UnknownHTTPResponseError } from '@notionhq/client';
import type {
  SearchResponse,
  AppendBlockChildrenResponse,
  BlockObjectRequest,
  CreatePageParameters,
  CreatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionPageApiService {
  constructor(private readonly notion: Client) {}

  async searchAllPages(): Promise<SearchResponse> {
    return this.notion.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        direction: 'ascending',
        timestamp: 'last_edited_time',
      },
    });
  }

  async createPage(params: CreatePageParameters): Promise<CreatePageResponse> {
    try {
      return await this.notion.pages.create(params);
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

  private apiErrorToException(e: Error): HttpException {
    const error = e as UnknownHTTPResponseError;
    const body = JSON.parse(error.body);
    return new BadRequestException(body.message);
  }
}
