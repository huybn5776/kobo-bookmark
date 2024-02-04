import { Controller, Post, UseInterceptors, Param, Body, Get } from '@nestjs/common';
import {
  BlockObjectRequest,
  AppendBlockChildrenResponse,
  SearchResponse,
  CreatePageParameters,
  CreatePageResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionAuthInterceptor } from '@/interceptor/notion-auth.interceptor';
import { NotionPageApiService } from '@/module/notion/api/notion-page-api.service';

@Controller('/notion/pages')
@UseInterceptors(NotionAuthInterceptor)
export class NotionPageController {
  constructor(private readonly notionPageApiService: NotionPageApiService) {}

  @Get()
  getAllPages(): Promise<SearchResponse> {
    return this.notionPageApiService.searchAllPages();
  }

  @Post()
  createPage(@Body() params: CreatePageParameters): Promise<CreatePageResponse> {
    return this.notionPageApiService.createPage(params);
  }

  @Post('/:id/blocks')
  appendBlock(@Param('id') id: string, @Body() blocks: BlockObjectRequest[]): Promise<AppendBlockChildrenResponse> {
    return this.notionPageApiService.appendBlock(id, blocks);
  }
}
