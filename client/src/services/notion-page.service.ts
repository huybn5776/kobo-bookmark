import type {
  OauthTokenResponse,
  PartialBlockObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { getBlockChildren } from '@/api/notion-block-api.service';
import { getAllPages, getPage } from '@/api/notion-page-api.service';

export async function getNotionExportTargetPageId(authResponse: OauthTokenResponse): Promise<string | null> {
  if (authResponse.duplicated_template_id) {
    return authResponse.duplicated_template_id;
  }
  const pages = await getAllPages();
  return pages.results[0]?.id;
}

export async function getAllBlocksOfPage(pageId: string): Promise<PartialBlockObjectResponse[]> {
  let cursor: string | undefined;
  cursor = undefined;
  const blocks: PartialBlockObjectResponse[] = [];
  do {
    const response = await getBlockChildren(pageId, cursor);
    blocks.push(...response.results);
    cursor = response.next_cursor || undefined;
  } while (cursor);
  return blocks;
}

export async function isPageExists(id: string): Promise<boolean> {
  try {
    const page = (await getPage(id)) as PageObjectResponse;
    return !page.archived;
  } catch (e) {
    return false;
  }
}
