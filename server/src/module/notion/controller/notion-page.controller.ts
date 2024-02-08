import { Controller, Post, UseInterceptors, Param, Query, Body, Get, Delete, Patch } from '@nestjs/common';
import {
  BlockObjectRequest,
  AppendBlockChildrenResponse,
  SearchResponse,
  CreatePageParameters,
  CreatePageResponse,
  DeleteBlockResponse,
  ListBlockChildrenResponse,
  UpdatePageParameters,
  UpdatePageResponse,
  GetPageResponse,
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

  @Get('/:id')
  getPage(@Param('id') id: string): Promise<GetPageResponse> {
    return this.notionPageApiService.getPage(id);
  }

  @Post()
  createPage(@Body() params: CreatePageParameters): Promise<CreatePageResponse> {
    return this.notionPageApiService.createPage(params);
  }

  @Patch('/:id')
  updatePage(
    @Param('id') id: string,
    @Body() params: Omit<UpdatePageParameters, 'page_id'>,
  ): Promise<UpdatePageResponse> {
    return this.notionPageApiService.updatePage(id, params);
  }

  @Get('/:id/blocks')
  getPageBlocks(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('pageSize') pageSize?: number,
  ): Promise<ListBlockChildrenResponse> {
    return this.notionPageApiService.getBlockChildren({ block_id: id, start_cursor: cursor, page_size: pageSize });
  }

  @Post('/:id/blocks')
  appendBlock(@Param('id') id: string, @Body() blocks: BlockObjectRequest[]): Promise<AppendBlockChildrenResponse> {
    return this.notionPageApiService.appendBlock(id, blocks);
  }

  @Delete('/:id')
  deletePage(@Param('id') id: string): Promise<DeleteBlockResponse> {
    return this.notionPageApiService.deleteBlock(id);
  }

  @Delete('/:id/blocks/\\$all')
  deleteAllChildBlocks(@Param('id') id: string): Promise<DeleteBlockResponse[]> {
    return this.notionPageApiService.deleteAllChildBlocks(id);
  }
}
