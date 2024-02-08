import { Controller, Post, UseInterceptors, Param, Body, Delete, HttpCode } from '@nestjs/common';
import {
  UpdateBlockParameters,
  UpdateBlockResponse,
  DeleteBlockResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionAuthInterceptor } from '@/interceptor/notion-auth.interceptor';
import { NotionPageApiService } from '@/module/notion/api/notion-page-api.service';

@Controller('/notion/blocks')
@UseInterceptors(NotionAuthInterceptor)
export class NotionBlockController {
  constructor(private readonly notionPageApiService: NotionPageApiService) {}

  @Post('/\\$deleteMulti')
  @HttpCode(200)
  deleteBlocks(@Body() blockIds: string[]): Promise<DeleteBlockResponse[]> {
    return this.notionPageApiService.deleteBlocks(blockIds);
  }

  @Post('/:id')
  updateBlock(
    @Param('id') id: string,
    @Body() params: Omit<UpdateBlockParameters, 'block_id'>,
  ): Promise<UpdateBlockResponse> {
    return this.notionPageApiService.updateBlock(id, params);
  }

  @Delete('/:id')
  deleteBlock(@Param('id') id: string): Promise<DeleteBlockResponse> {
    return this.notionPageApiService.deleteBlock(id);
  }
}
