import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';

import { getAllPages } from '@/api/notion-page-api.service';

export async function getNotionExportTargetPageId(authResponse: OauthTokenResponse): Promise<string | null> {
  if (authResponse.duplicated_template_id) {
    return authResponse.duplicated_template_id;
  }
  const pages = await getAllPages();
  return pages.results[0]?.id;
}
