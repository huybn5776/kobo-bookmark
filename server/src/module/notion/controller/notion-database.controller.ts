import { Controller, UseInterceptors, Param, Get, Query } from '@nestjs/common';
import { GetDatabaseResponse, SearchResponse, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { NotionAuthInterceptor } from '@/interceptor/notion-auth.interceptor';
import { NotionDatabaseApiService } from '@/module/notion/api/notion-database-api.service';

@Controller('/notion/databases')
@UseInterceptors(NotionAuthInterceptor)
export class NotionDatabaseController {
  constructor(private readonly notionDatabaseApiService: NotionDatabaseApiService) {}

  @Get()
  searchDatabase(@Query('title') title?: string): Promise<SearchResponse> {
    return this.notionDatabaseApiService.searchDatabases(title);
  }

  @Get('/:id')
  getDatabase(@Param('id') id: string): Promise<GetDatabaseResponse> {
    return this.notionDatabaseApiService.getDatabase(id);
  }

  @Get('/:id/query')
  queryDatabase(@Param('id') id: string, @Query('bookId') bookId: string): Promise<QueryDatabaseResponse> {
    return this.notionDatabaseApiService.queryDatabase(id, { 'Book id': bookId });
  }
}
