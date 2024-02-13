import { Injectable, BadRequestException, HttpException } from '@nestjs/common';
import { Client, UnknownHTTPResponseError } from '@notionhq/client';
import { GetDatabaseResponse, SearchResponse } from '@notionhq/client/build/src/api-endpoints';

@Injectable()
export class NotionDatabaseApiService {
  constructor(private readonly notion: Client) {}

  async searchDatabases(title?: string): Promise<SearchResponse> {
    return this.notion.search({
      query: title,
      filter: {
        property: 'object',
        value: 'database',
      },
      sort: {
        direction: 'ascending',
        timestamp: 'last_edited_time',
      },
    });
  }

  async getDatabase(id: string): Promise<GetDatabaseResponse> {
    try {
      return await this.notion.databases.retrieve({ database_id: id });
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
