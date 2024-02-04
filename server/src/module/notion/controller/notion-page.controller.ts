import { Controller, UseInterceptors, Get } from '@nestjs/common';
import { SearchResponse } from '@notionhq/client/build/src/api-endpoints';

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
}
