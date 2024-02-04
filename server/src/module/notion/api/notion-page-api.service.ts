import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import type { SearchResponse } from '@notionhq/client/build/src/api-endpoints';

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
}
