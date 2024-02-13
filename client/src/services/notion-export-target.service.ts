import type {
  PartialDatabaseObjectResponse,
  OauthTokenResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { searchDatabase, getDatabase } from '@/api/notion-database-api.service';
import { searchPages } from '@/api/notion-page-api.service';
import { KoboBook } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import { isPageExists } from '@/services/notion-page.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

const templateDatabaseTitle = 'Library';
const templateDatabaseProperties = ['Title', 'Author', 'Publisher', 'ISBN'];

export async function getNotionExportTargetPage(): Promise<string | null> {
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

export async function getNotionExportTargetPageId(authResponse: OauthTokenResponse): Promise<string | null> {
  if (authResponse.duplicated_template_id) {
    return authResponse.duplicated_template_id;
  }
  const pages = await searchPages();
  return pages.results[0]?.id;
}

export async function getNotionExportTargetDatabase(): Promise<string | null> {
  const databaseId = getSettingFromStorage(SettingKey.NotionExportTargetDatabaseId);
  if (databaseId && (await isLibraryDatabaseId(databaseId))) {
    return databaseId;
  }
  const pageId = await getNotionExportTargetPage();
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

export async function findPageByTitleAndCoverImage(book: KoboBook): Promise<PageObjectResponse | undefined> {
  const pages = (await searchPages(book.info.title)).results as PageObjectResponse[];
  return pages.find((page) => {
    if (page.parent.type !== 'page_id') {
      return false;
    }
    const coverImage = page.cover;
    if (coverImage?.type !== 'external') {
      return false;
    }
    const url = new URL(coverImage.external.url);
    const bookId = url.searchParams.get('kobo-bookmark-book-id');
    return bookId === book.id;
  });
}
