import type {
  CreatePageParameters,
  CreatePageResponse,
  BlockObjectRequest,
} from '@notionhq/client/build/src/api-endpoints';
import { splitEvery } from 'ramda';

import { appendNotionBlocks, deleteBlocks, deleteBlock } from '@/api/notion-block-api.service';
import { createNotionPage, updateNotionPage } from '@/api/notion-page-api.service';
import { KoboBook, NotionExportState } from '@/dto/kobo-book';
import { BookExportTask, BookExportStage, BookExportState } from '@/interface/book-export-task';
import {
  bookToNotionUpdatePageParams,
  bookmarksToNotionBlocks,
  bookToNotionDatabasePageProperties,
} from '@/services/notion-export-mapping.service';
import {
  getNotionExportTargetDatabase,
  getNotionExportTargetPage,
  findPageByTitleAndCoverImage,
} from '@/services/notion-export-target.service';
import { getAllBlocksOfPage, isPageExists } from '@/services/notion-page.service';

const maximumBlocksPerRequest = 100;
const deleteBlockCountPerRequest = 5;

export async function exportBookBookmarks(
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (progress: BookExportTask) => void,
): Promise<NotionExportState> {
  const task: BookExportTask = {
    ...initialTask,
    state: BookExportState.Running,
    stage: BookExportStage.CheckingTargetPage,
  };
  progressCallback(task);

  const targetDatabase = await getNotionExportTargetDatabase();
  if (targetDatabase) {
    const page = await exportBookmarksToDatabasePage(targetDatabase, book, task, progressCallback);
    return { ...book.notion, lastDatabasePageId: page.id };
  }

  if (book.notion?.lastPageId && (await isPageExists(book.notion.lastPageId))) {
    await exportBookmarksToExistingPage(book.notion.lastPageId, book, task, progressCallback);
    return book.notion;
  }
  const existingPage = await findPageByTitleAndCoverImage(book);
  if (existingPage) {
    await exportBookmarksToExistingPage(existingPage.id, book, task, progressCallback);
    return { ...book.notion, lastPageId: existingPage.id };
  }
  const page = await exportBookmarksToNewPage(book, task, progressCallback);
  return { ...book.notion, lastPageId: page.id };
}

async function exportBookmarksToNewPage(
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (progress: BookExportTask) => void,
): Promise<CreatePageResponse> {
  let task: BookExportTask = { ...initialTask, stage: BookExportStage.CreatePage };

  const targetPageId = await getNotionExportTargetPage();
  if (!targetPageId) {
    progressCallback({ ...task, state: BookExportState.Failed });
    throw new Error('No target Notion page to export');
  }

  const pageParams: CreatePageParameters = {
    parent: { type: 'page_id', page_id: targetPageId },
    ...bookToNotionUpdatePageParams(book),
  };
  const allBlocks = bookmarksToNotionBlocks(book.bookmarks);
  return createPageAndBlocks(pageParams, allBlocks, (update) => progressCallback((task = update(task))));
}

async function exportBookmarksToDatabasePage(
  databaseId: string,
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (task: BookExportTask) => void,
): Promise<CreatePageResponse> {
  let task: BookExportTask = { ...initialTask };

  if (book.notion?.lastDatabasePageId) {
    progressCallback((task = { ...task, stage: BookExportStage.CleanupPage }));
    await deleteBlock(book.notion?.lastDatabasePageId);
  }

  progressCallback((task = { ...task, stage: BookExportStage.CreatePage }));
  const pageParams: CreatePageParameters = {
    parent: { type: 'database_id', database_id: databaseId },
    ...bookToNotionUpdatePageParams(book),
    properties: bookToNotionDatabasePageProperties(book),
  };
  const allBlocks = bookmarksToNotionBlocks(book.bookmarks);
  return createPageAndBlocks(pageParams, allBlocks, (update) => progressCallback((task = update(task))));
}

async function createPageAndBlocks(
  pageParams: CreatePageParameters,
  allBlocks: BlockObjectRequest[],
  updateTask: (update: (task: BookExportTask) => BookExportTask) => void,
): Promise<CreatePageResponse> {
  updateTask((task) => ({ ...task, stage: BookExportStage.CreatePage }));

  if (allBlocks.length <= maximumBlocksPerRequest) {
    const page = await createNotionPage({ ...pageParams, children: allBlocks });
    updateTask((task) => ({ ...task, state: BookExportState.Succeeded }));
    return page;
  }

  updateTask((task) => ({ ...task, step: 0, totalStep: 2, stage: BookExportStage.CreatePage }));
  const page = await createNotionPage({ ...pageParams, children: allBlocks.slice(0, maximumBlocksPerRequest) });

  updateTask((task) => ({ ...task, percentage: 0, step: (task.step ?? 0) + 1, stage: BookExportStage.AddBlocks }));
  const extraBlockToAdd = allBlocks.slice(maximumBlocksPerRequest);
  const windowedBlocks = splitEvery(maximumBlocksPerRequest, extraBlockToAdd);
  let completedCount = 0;
  for (const blocks of windowedBlocks) {
    await appendNotionBlocks(page.id, blocks);
    completedCount += blocks.length;
    const percentage = (completedCount / extraBlockToAdd.length) * 100;
    updateTask((task) => ({ ...task, percentage }));
  }

  updateTask((task) => ({ ...task, state: BookExportState.Succeeded }));
  return page;
}

export async function exportBookmarksToExistingPage(
  pageId: string,
  book: KoboBook,
  initialTask: BookExportTask,
  progressCallback: (task: BookExportTask) => void,
): Promise<void> {
  let task: BookExportTask = {
    ...initialTask,
    percentage: 0,
    step: 0,
    totalStep: 3,
    stage: BookExportStage.CleanupPage,
  };
  const updateProgress = (t: BookExportTask) => progressCallback((task = t));

  await clearPage(pageId, (percentage) => updateProgress({ ...task, percentage }));

  updateProgress({ ...task, percentage: undefined, step: (task.step ?? 0) + 1, stage: BookExportStage.UpdatePage });
  await updatePagePropertiesByBook(pageId, book);

  updateProgress({ ...task, percentage: 0, step: (task.step ?? 0) + 1, stage: BookExportStage.AddBlocks });
  await appendBookmarkToPage(pageId, book, (percentage) => updateProgress({ ...task, percentage }));
  updateProgress({ ...task, state: BookExportState.Succeeded });
}

export async function updatePagePropertiesByBook(pageId: string, book: KoboBook): Promise<void> {
  const params = bookToNotionUpdatePageParams(book);
  await updateNotionPage(pageId, params);
}

export async function appendBookmarkToPage(
  pageId: string,
  book: KoboBook,
  progressCallback?: (percentage: number) => void,
): Promise<void> {
  const allBlocks = bookmarksToNotionBlocks(book.bookmarks);
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
