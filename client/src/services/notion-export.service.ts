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
import { BookExportTask, BookExportStage, BookExportState } from '@/interface/book-export-task';
import { getNotionExportTargetPageId, getAllBlocksOfPage, isPageExists } from '@/services/notion-page.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

const maximumBlocksPerRequest = 100;
const deleteBlockCountPerRequest = 5;

export async function exportBookBookmarks(
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (progress: BookExportTask) => void,
): Promise<string> {
  const task: BookExportTask = { ...initialTask, state: BookExportState.Running };
  progressCallback(task);

  if (book.lastExportedNotionPageId && (await isPageExists(book.lastExportedNotionPageId))) {
    const pageId = book.lastExportedNotionPageId;
    await exportBookmarksToExistingPage(book.lastExportedNotionPageId, book, task, progressCallback);
    return pageId;
  }
  const response = await exportBookmarksToNewPage(book, task, progressCallback);
  return response.id;
}

async function exportBookmarksToNewPage(
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (progress: BookExportTask) => void,
): Promise<CreatePageResponse> {
  let task: BookExportTask = { ...initialTask, step: 0, totalStep: 2, stage: BookExportStage.CreatePage };
  const updateTask = (t: BookExportTask) => progressCallback((task = t));

  const targetPageId = await getExportTargetPage();
  if (!targetPageId) {
    updateTask({ ...task, state: BookExportState.Failed });
    throw new Error('No target Notion page to export');
  }

  const pageParams = bookToCreatePageParams(toRaw(book), targetPageId);
  const allBlocks = bookmarksToBlocks(book.bookmarks);

  if (allBlocks.length <= maximumBlocksPerRequest) {
    pageParams.children = allBlocks;
    const response = await createNotionPage(pageParams);
    updateTask({ ...task, state: BookExportState.Succeeded });
    return response;
  }

  pageParams.children = allBlocks.slice(0, maximumBlocksPerRequest);
  const page = await createNotionPage(pageParams);
  updateTask({ ...task, step: (task.step ?? 0) + 1, stage: BookExportStage.AddBlocks });

  const extraBlockToAdd = allBlocks.slice(maximumBlocksPerRequest);
  const windowedBlocks = splitEvery(maximumBlocksPerRequest, extraBlockToAdd);
  let completedCount = 0;
  for (const blocks of windowedBlocks) {
    await appendNotionBlocks(page.id, blocks);
    completedCount += blocks.length;
    updateTask({ ...task, percentage: (completedCount / extraBlockToAdd.length) * 100 });
  }

  updateTask({ ...task, state: BookExportState.Succeeded });
  return page;
}

export async function exportBookmarksToExistingPage(
  pageId: string,
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (task: BookExportTask) => void,
) {
  let task: BookExportTask = { ...initialTask, step: 0, totalStep: 3, stage: BookExportStage.CleanupPage };
  const updateTask = (t: BookExportTask) => progressCallback((task = t));

  await clearPage(pageId, (percentage) => updateTask({ ...task, percentage }));

  updateTask({ ...task, step: (task.step ?? 0) + 1, stage: BookExportStage.UpdatePage });
  await updatePagePropertiesByBook(pageId, book);

  updateTask({ ...task, step: (task.step ?? 0) + 1, stage: BookExportStage.AddBlocks });
  await appendBookmarkToPage(pageId, book, (percentage) => updateTask({ ...task, percentage }));
  updateTask({ ...task, state: BookExportState.Succeeded });
}

export async function updatePagePropertiesByBook(pageId: string, book: KoboBook): Promise<void> {
  const params = bookToUpdatePageParams(book);
  await updateNotionPage(pageId, params);
}

export async function appendBookmarkToPage(
  pageId: string,
  book: KoboBook,
  progressCallback?: (percentage: number) => void,
): Promise<void> {
  const allBlocks = bookmarksToBlocks(book.bookmarks);
  const windowedBlocks = splitEvery(100, allBlocks);
  progressCallback?.(0);
  let completedCount = 0;

  for (const blocks of windowedBlocks) {
    await appendNotionBlocks(pageId, blocks);
    completedCount += blocks.length;
    progressCallback?.((completedCount / allBlocks.length) * 100);
  }
}

export async function clearPage(pageId: string, progressCallback?: (percentage: number) => void): Promise<void> {
  const allBlocks = await getAllBlocksOfPage(pageId);
  const allBlockIds = allBlocks.map((block) => block.id);
  const windowedBlockIds = splitEvery(deleteBlockCountPerRequest, allBlockIds);
  progressCallback?.(0);
  let completedCount = 0;

  for (const blockIds of windowedBlockIds) {
    await deleteBlocks(blockIds);
    completedCount += blockIds.length;
    progressCallback?.((completedCount / allBlocks.length) * 100);
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
