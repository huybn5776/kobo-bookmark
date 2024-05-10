import { DropboxResponseError, files } from 'dropbox';

import { KoboBook } from '@/dto/kobo-book';
import { SettingValueType } from '@/enum/setting-key';
import { saveJsonToDropbox, getTextFromDropbox, getJsonFromDropbox } from '@/services/dropbox/dropbox.service';

const settingsFileName = 'settings.json';
const booksFileName = 'books-store.json';

export async function uploadSettingsToDropbox(settingValues: Partial<SettingValueType>): Promise<boolean> {
  try {
    await saveJsonToDropbox(settingsFileName, settingValues);
  } catch (e) {
    const error = e as DropboxResponseError<files.UploadError>;
    console.error(error);
    return false;
  }
  return true;
}

export async function downloadSettingsFromDropbox(): Promise<Partial<SettingValueType> | null> {
  try {
    return await getJsonFromDropbox(settingsFileName);
  } catch (e) {
    const error = e as DropboxResponseError<files.DownloadError>;
    console.error(error);
  }
  return null;
}

export async function uploadBooksToDropbox(books: KoboBook[]): Promise<boolean> {
  try {
    await saveJsonToDropbox(booksFileName, books);
  } catch (e) {
    const error = e as DropboxResponseError<files.UploadError>;
    console.error(error);
    return false;
  }
  return true;
}

export async function downloadBooksFromDropbox(): Promise<string | null> {
  try {
    return await getTextFromDropbox(booksFileName);
  } catch (e) {
    const error = e as DropboxResponseError<files.DownloadError>;
    console.error(error);
  }
  return null;
}
