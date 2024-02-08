import { toRaw } from 'vue';

import type {
  CreatePageParameters,
  CreatePageResponse,
  BlockObjectRequest,
  UpdatePageParameters,
} from '@notionhq/client/build/src/api-endpoints';
import { splitEvery } from 'ramda';

import { createNotionPage, appendNotionBlocks, deleteBlocks, updateNotionPage } from '@/api/notion-page-api.service';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import { getNotionExportTargetPageId, getAllBlocksOfPage } from '@/services/notion-page.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

const maximumBlocksPerRequest = 100;
const deleteBlockCountPerRequest = 5;

export async function exportBookBookmarks(book: KoboBook): Promise<CreatePageResponse> {
  const targetPageId = await getExportTargetPage();
  if (!targetPageId) {
    throw new Error('No target Notion page to export');
  }

  const pageParams = bookToCreatePageParams(toRaw(book), targetPageId);
  const allBlocks = bookmarksToBlocks(book.bookmarks);

  if (allBlocks.length <= maximumBlocksPerRequest) {
    pageParams.children = allBlocks;
    return createNotionPage(pageParams);
  }
  pageParams.children = allBlocks.slice(0, maximumBlocksPerRequest);
  const page = await createNotionPage(pageParams);

  const windowedBlocks = splitEvery(maximumBlocksPerRequest, allBlocks.slice(maximumBlocksPerRequest));
  for (const blocks of windowedBlocks) {
    await appendNotionBlocks(page.id, blocks);
  }

  return page;
}

export async function updatePagePropertiesByBook(pageId: string, book: KoboBook): Promise<void> {
  const params = bookToUpdatePageParams(book);
  await updateNotionPage(pageId, params);
}

export async function appendBookmarkToPage(pageId: string, book: KoboBook): Promise<void> {
  const allBlocks = bookmarksToBlocks(book.bookmarks);
  const windowedBlocks = splitEvery(maximumBlocksPerRequest, allBlocks);
  for (const blocks of windowedBlocks) {
    await appendNotionBlocks(pageId, blocks);
  }
}

export async function clearPage(pageId: string): Promise<void> {
  const allBlocks = await getAllBlocksOfPage(pageId);
  const allBlockIds = allBlocks.map((block) => block.id);
  const windowedBlockIds = splitEvery(deleteBlockCountPerRequest, allBlockIds);
  for (const blockIds of windowedBlockIds) {
    await deleteBlocks(blockIds);
  }
}

function bookToCreatePageParams(book: KoboBook, parentPageId: string): CreatePageParameters {
  const updatePageParams = bookToUpdatePageParams(book);
  return {
    parent: {
      type: 'page_id',
      page_id: parentPageId,
    },
    ...updatePageParams,
  };
}

function bookToUpdatePageParams(
  book: KoboBook,
): Omit<UpdatePageParameters, 'page_id'> & Required<Pick<UpdatePageParameters, 'properties'>> {
  const pageParams: ReturnType<typeof bookToUpdatePageParams> = {
    properties: {
      title: [{ text: { content: book.info.title || '' } }],
    },
  };
  if (book.coverImageUrl) {
    const image: { external: { url: string }; type?: 'external' } = {
      type: 'external',
      external: { url: book.coverImageUrl },
    };
    pageParams.cover = image;
    pageParams.icon = image;
  }
  return pageParams;
}

function bookmarksToBlocks(bookmarks: KoboBookmark[]): BlockObjectRequest[] {
  const divider: BlockObjectRequest = { object: 'block', type: 'divider', divider: {} };
  return bookmarks.flatMap((bookmark, index) => {
    const chapterText =
      bookmark.chapter.parentChapters.map((chapter) => `${chapter.title} > `) + bookmark.chapter.titles.join(' - ');
    const chapterBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [{ text: { content: chapterText } }],
        color: 'gray_background',
      },
    };
    const textBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [
          {
            text: {
              content: bookmark.text,
            },
          },
        ],
      },
    };
    const blocks: BlockObjectRequest[] = [chapterBlock, textBlock];
    if (index !== 0) {
      blocks.unshift(divider);
    }
    return blocks;
  });
}

async function getExportTargetPage(): Promise<string | null> {
  let exportTargetPageId = getSettingFromStorage(SettingKey.NotionExportTargetPageId);
  if (exportTargetPageId) {
    return exportTargetPageId;
  }
  const auth = getSettingFromStorage(SettingKey.NotionAuth);
  if (!auth) {
    return null;
  }
  exportTargetPageId = await getNotionExportTargetPageId(auth);
  if (exportTargetPageId) {
    saveSettingToStorage(SettingKey.NotionExportTargetPageId, exportTargetPageId);
  }
  return exportTargetPageId;
}
