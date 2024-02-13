import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { Client, UnknownHTTPResponseError } from '@notionhq/client';
import {
  SearchResponse,
  CreatePageParameters,
  CreatePageResponse,
  UpdatePageParameters,
  UpdatePageResponse,
  GetPageResponse,
} from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionPageApiService {
  constructor(private readonly notion: Client) {}

  async searchPages(title?: string): Promise<SearchResponse> {
    return this.notion.search({
      query: title,
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

  async getPage(id: string): Promise<GetPageResponse> {
    try {
      return await this.notion.pages.retrieve({ page_id: id });
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async createPage(params: CreatePageParameters): Promise<CreatePageResponse> {
    try {
      return await this.notion.pages.create(params);
    } catch (e) {
      throw this.apiErrorToException(e as Error);
    }
  }

  async updatePage(id: string, params: Omit<UpdatePageParameters, 'page_id'>): Promise<UpdatePageResponse> {
    try {
      return await this.notion.pages.update({ page_id: id, ...params });
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
