import { Controller, Post, UseInterceptors, Param, Body, Delete, HttpCode, Get } from '@nestjs/common';
import {
  UpdateBlockParameters,
  UpdateBlockResponse,
  DeleteBlockResponse,
  GetBlockResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionAuthInterceptor } from '@/interceptor/notion-auth.interceptor';
import { NotionBlockApiService } from '@/module/notion/api/notion-block-api.service';

@Controller('/notion/blocks')
@UseInterceptors(NotionAuthInterceptor)
export class NotionBlockController {
  constructor(private readonly notionBlockApiService: NotionBlockApiService) {}

  @Get('/:id')
  getBlock(@Param('id') id: string): Promise<GetBlockResponse> {
    return this.notionBlockApiService.getBlock(id);
  }

  @Post('/\\$deleteMulti')
  @HttpCode(200)
  deleteBlocks(@Body() blockIds: string[]): Promise<DeleteBlockResponse[]> {
    return this.notionBlockApiService.deleteBlocks(blockIds);
  }

  @Post('/:id')
  updateBlock(
    @Param('id') id: string,
    @Body() params: Omit<UpdateBlockParameters, 'block_id'>,
  ): Promise<UpdateBlockResponse> {
    return this.notionBlockApiService.updateBlock(id, params);
  }

  @Delete('/:id')
  deleteBlock(@Param('id') id: string): Promise<DeleteBlockResponse> {
    return this.notionBlockApiService.deleteBlock(id);
  }
}
