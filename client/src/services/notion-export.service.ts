import { toRaw } from 'vue';

import type {
  CreatePageParameters,
  CreatePageResponse,
  BlockObjectRequest,
} from '@notionhq/client/build/src/api-endpoints';
import { sortWith, ascend, splitEvery } from 'ramda';

import { createNotionPage, appendNotionBlocks } from '@/api/notion-page-api.service';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import { getNotionExportTargetPageId } from '@/services/notion-page.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

export async function exportBookBookmarks(book: KoboBook): Promise<CreatePageResponse> {
  const targetPageId = await getExportTargetPage();
  if (!targetPageId) {
    throw new Error('No target Notion page to export');
  }

  const pageParams = bookToPageParams(toRaw(book), targetPageId);
  if ((pageParams.children?.length ?? 0) <= 100) {
    return createNotionPage(pageParams);
  }
  const allBlocks = pageParams.children || [];
  pageParams.children = allBlocks.slice(0, 100);
  const page = await createNotionPage(pageParams);

  const windowedBlocks = splitEvery(100, allBlocks.slice(100));
  for (const blocks of windowedBlocks) {
    await appendNotionBlocks(page.id, blocks);
  }

  return page;
}

function bookToPageParams(book: KoboBook, parentPageId: string): CreatePageParameters {
  const pageParams: CreatePageParameters = {
    parent: {
      type: 'page_id',
      page_id: parentPageId,
    },
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
  pageParams.children = bookmarksToBlocks(book.bookmarks);
  return pageParams;
}

function bookmarksToBlocks(bookmarks: KoboBookmark[]): BlockObjectRequest[] {
  const sortedBookmarks = sortWith(
    [ascend((bookmark) => bookmark.chapter.relatedChapters[0].index), ascend((bookmark) => bookmark.chapterProgress)],
    bookmarks,
  );
  const divider: BlockObjectRequest = { object: 'block', type: 'divider', divider: {} };
  return sortedBookmarks.flatMap((bookmark, index) => {
    const chapterBlock: BlockObjectRequest = {
      paragraph: {
        rich_text: [{ text: { content: bookmark.chapter.titles.join(' - ') } }],
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
