import type {
  CreatePageParameters,
  CreatePageResponse,
  BlockObjectRequest,
  UpdatePageParameters,
  PartialDatabaseObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { splitEvery, maxBy } from 'ramda';

import { appendNotionBlocks, deleteBlocks, deleteBlock } from '@/api/notion-block-api.service';
import { searchDatabase, getDatabase } from '@/api/notion-database-api.service';
import { createNotionPage, updateNotionPage } from '@/api/notion-page-api.service';
import { KoboBook, KoboBookmark, NotionExportState } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import { BookExportTask, BookExportStage, BookExportState } from '@/interface/book-export-task';
import { getNotionExportTargetPageId, getAllBlocksOfPage, isPageExists } from '@/services/notion-page.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

const maximumBlocksPerRequest = 100;
const deleteBlockCountPerRequest = 5;
const templateDatabaseTitle = 'Library';
const templateDatabaseProperties = ['Title', 'Author', 'Publisher', 'ISBN'];

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

  const targetDatabase = await getExportTargetDatabase();
  if (targetDatabase) {
    const page = await exportBookmarksToDatabasePage(targetDatabase, book, task, progressCallback);
    return { ...book.notion, lastDatabasePageId: page.id };
  }

  if (book.notion?.lastPageId && (await isPageExists(book.notion.lastPageId))) {
    await exportBookmarksToExistingPage(book.notion.lastPageId, book, task, progressCallback);
    return book.notion;
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

  const targetPageId = await getExportTargetPage();
  if (!targetPageId) {
    progressCallback({ ...task, state: BookExportState.Failed });
    throw new Error('No target Notion page to export');
  }

  const pageParams: CreatePageParameters = {
    parent: { type: 'page_id', page_id: targetPageId },
    ...bookToUpdatePageParams(book),
  };
  const allBlocks = bookmarksToBlocks(book.bookmarks);
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
    ...bookToUpdatePageParams(book),
    properties: bookToDatabasePageProperties(book),
  };
  const allBlocks = bookmarksToBlocks(book.bookmarks);
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

function bookToDatabasePageProperties(book: KoboBook): CreatePageParameters['properties'] {
  const { title, author, publisher, isbn } = book.info;
  const lastBookmarkedTime = book.bookmarks.reduce(maxBy((bookmark) => bookmark.updatedAt)).updatedAt;
  const updateTime = book.info.dateLastRead;

  return {
    ...(title ? { Title: { title: [{ text: { content: title } }] } } : {}),
    ...(author ? { Author: { rich_text: [{ text: { content: author } }] } } : {}),
    ...(publisher ? { Publisher: { rich_text: [{ text: { content: publisher } }] } } : {}),
    ...(isbn ? { ISBN: { rich_text: [{ text: { content: isbn } }] } } : {}),
    'Last bookmarked time': { date: { start: lastBookmarkedTime.toISOString() } },
    ...(updateTime ? { 'Update time': { date: { start: updateTime.toISOString() } } } : {}),
  };
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

async function getExportTargetDatabase(): Promise<string | null> {
  const databaseId = getSettingFromStorage(SettingKey.NotionExportTargetDatabaseId);
  if (databaseId && (await isLibraryDatabaseId(databaseId))) {
    return databaseId;
  }
  const pageId = getSettingFromStorage(SettingKey.NotionExportTargetPageId);
  if (!pageId || !(await isPageExists(pageId))) {
    return null;
  }
  const database = await findFirstLibraryDatabase();
  if (!database) {
    return null;
  }
  saveSettingToStorage(SettingKey.NotionExportTargetDatabaseId, database.id);
  return database.id;
}

async function findFirstLibraryDatabase(): Promise<PartialDatabaseObjectResponse | undefined> {
  const response = await searchDatabase(templateDatabaseTitle);
  return response.results.find(isLibraryDatabase);
}

function isLibraryDatabase(database: PartialDatabaseObjectResponse): boolean {
  const { properties } = database;
  return templateDatabaseProperties.every((p) => p in properties);
}

async function isLibraryDatabaseId(databaseId: string): Promise<boolean> {
  const database = await getDatabase(databaseId);
  return isLibraryDatabase(database);
}
