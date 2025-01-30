<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.backup.title" />
    </h3>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.backup.title_setting_value" />
      </p>
      <div class="setting-buttons-row">
        <NButton @click="exportAllSettings">
          <i18n-t keypath="page.settings.backup.export_all_settings" />
        </NButton>
        <NButton @click="importSettings">
          <i18n-t keypath="page.settings.backup.import_settings" />
        </NButton>
        <NButton @click="clearSettings">
          <i18n-t keypath="page.settings.backup.reset_all_settings" />
        </NButton>
        <NButton :loading="uploadSettingsToDropboxLoading" @click="processUploadSettingsToDropbox">
          <template #icon>
            <Icon name="cloud-arrow-up" class="icon-24" />
          </template>
          <i18n-t keypath="page.settings.backup.upload_to_dropbox" />
        </NButton>
        <NButton :loading="loadSettingsFromDropboxLoading" @click="processLoadSettingsFromDropbox">
          <template #icon>
            <Icon name="cloud-arrow-down" class="icon-24" />
          </template>
          <i18n-t keypath="page.settings.backup.import_from_dropbox" />
        </NButton>
      </div>
    </div>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.backup.title_book_and_bookmarks" />
      </p>
      <div class="setting-buttons-row">
        <NButton @click="exportAllBooks">
          <i18n-t keypath="page.settings.backup.export_all_books" />
        </NButton>
        <NButton @click="importBooks">
          <i18n-t keypath="page.settings.backup.import_books" />
        </NButton>
        <NButton @click="clearBooks">
          <i18n-t keypath="page.settings.backup.clear_all_books" />
        </NButton>
        <NButton :loading="uploadBooksToDropboxLoading" @click="processUploadBooksToDropbox">
          <template #icon>
            <Icon name="cloud-arrow-up" class="icon-24" />
          </template>
          <i18n-t keypath="page.settings.backup.upload_to_dropbox" />
        </NButton>
        <NButton :loading="downloadBooksFromDropboxLoading" @click="processDownloadBooksFromDropbox">
          <template #icon>
            <Icon name="cloud-arrow-down" class="icon-24" />
          </template>
          <i18n-t keypath="page.settings.backup.import_from_dropbox" />
        </NButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue';

import { NButton, useMessage, useNotification, useDialog } from 'naive-ui';
import { path, isNil } from 'ramda';
import { useI18n } from 'vue-i18n';
import { ZodError } from 'zod';

import Icon from '@/component/icon/Icon.vue';
import MultiLineText from '@/component/MultiLineText/MultiLineText.vue';
import { useCheckDropboxToken } from '@/composition/use-check-dropbox-token';
import { useParseKoboBooksJson } from '@/composition/use-parse-kobo-books-json';
import { I18NMessageSchema } from '@/config/i18n-config';
import { SettingEventType } from '@/enum/setting-event-type';
import { SettingValueType, SettingKey } from '@/enum/setting-key';
import { settingValueSchema } from '@/schema/setting-value-schema';
import {
  getAllBooksFromDb,
  putBooksToDb,
  deleteBookTable,
  countAllBooksFromDb,
} from '@/services/bookmark/bookmark-manage.service';
import {
  uploadBooksToDropbox,
  downloadBooksFromDropbox,
  uploadSettingsToDropbox,
  downloadSettingsFromDropbox,
} from '@/services/dropbox/dropbox-backup.service';
import {
  saveSettingToStorage,
  getSettingValues,
  getSettingFromStorage,
  deleteAllSettingFromStorage,
} from '@/services/setting.service';
import { focusLastButtonOfDialog } from '@/util/dialog-utils';
import { saveDataToJsonFile, selectFile } from '@/util/file-utils';
import { isNotNilOrEmpty } from '@/util/object-utils';

const { t, locale } = useI18n<[I18NMessageSchema]>();

const message = useMessage();
const notification = useNotification();
const dialog = useDialog();

const uploadSettingsToDropboxLoading = ref<boolean>(false);
const loadSettingsFromDropboxLoading = ref<boolean>(false);
const uploadBooksToDropboxLoading = ref<boolean>(false);
const downloadBooksFromDropboxLoading = ref<boolean>(false);

const { parseBooksJson } = useParseKoboBooksJson();
const { checkIsDropboxReady } = useCheckDropboxToken();

function exportAllSettings(): void {
  const settings = getSettingValues();
  saveDataToJsonFile(settings, { fileName: 'kobo-bookmark-settings' });
}

async function importSettings(): Promise<void> {
  notification.destroyAll();

  const jsonObject = await getFirstSelectedJsonFileContent();
  if (!jsonObject) {
    return;
  }
  const success = loadSettings(jsonObject);
  if (success) {
    message.success(t('page.settings.backup.setting_applied'));
  }
}

function loadSettings(jsonObject: unknown): boolean {
  if (Array.isArray(jsonObject)) {
    notification.error({
      title: t('page.settings.backup.fail_to_import_settings'),
      content: t('page.settings.backup.data_structure_error'),
    });
    return false;
  }

  let settingValues: SettingValueType;
  try {
    settingValues = settingValueSchema.parse(jsonObject) as SettingValueType;
  } catch (e) {
    handleSettingSchemaParseError(e as ZodError, jsonObject as SettingValueType);
    return false;
  }

  for (const key of Object.values(SettingKey)) {
    const value = settingValues[key];
    if (isNotNilOrEmpty(value)) {
      saveSettingToStorage(key, value, SettingEventType.Backup);
    }
  }
  applyLanguageSetting();

  return true;
}

function handleSettingSchemaParseError(zodError: ZodError, settingValue: SettingValueType): void {
  const detailMessages = zodErrorToMessages(zodError, settingValue);
  notification.error({
    title: t('page.settings.backup.fail_to_import_settings'),
    meta: () => h(MultiLineText, { texts: detailMessages }),
  });
}

function clearSettings(): void {
  dialog.warning({
    title: t('page.settings.backup.reset_all_settings'),
    content: t('page.settings.backup.confirm_reset_all_settings'),
    negativeText: t('common.cancel'),
    positiveText: t('common.yes'),
    onPositiveClick: () => {
      deleteAllSettingFromStorage(SettingEventType.User);
      applyLanguageSetting();
      message.success(t('page.settings.backup.all_settings_reset'));
    },
    onAfterEnter: focusLastButtonOfDialog,
  });
}

async function exportAllBooks(): Promise<void> {
  const books = await getAllBooksFromDb();
  saveDataToJsonFile(books, { fileName: 'kobo-books' });
}

async function importBooks(): Promise<void> {
  notification.destroyAll();

  const files = await selectFile({ fileTypes: ['json'] });
  if (!Object.entries(files).length) {
    return;
  }
  const jsonFile = Object.values(files)[0];
  const jsonContent = await jsonFile.text();
  const books = parseBooksJson(jsonContent);
  if (!books) {
    return;
  }
  await putBooksToDb(books);
  message.success(t('page.settings.backup.book_imported', [books.length], books.length));
}

async function clearBooks(): Promise<void> {
  const booksCount = await countAllBooksFromDb();
  if (!booksCount) {
    message.warning(t('page.settings.backup.clear_empty_books'));
    return;
  }
  dialog.warning({
    title: t('page.settings.backup.clear_all_books'),
    content: t('page.settings.backup.confirm_clear_all_books', [booksCount], booksCount),
    negativeText: t('common.cancel'),
    positiveText: t('common.yes'),
    onPositiveClick: async () => {
      await deleteBookTable();
      message.success(t('page.settings.backup.all_books_cleared'));
    },
    onAfterEnter: focusLastButtonOfDialog,
  });
}

async function processUploadSettingsToDropbox(): Promise<void> {
  if (!checkIsDropboxReady()) {
    return;
  }
  uploadSettingsToDropboxLoading.value = true;
  const settingValues = getSettingValues();
  await uploadSettingsToDropbox(settingValues);
  uploadSettingsToDropboxLoading.value = false;
  message.success(t('page.settings.backup.settings_uploaded'));
}

async function processLoadSettingsFromDropbox(): Promise<void> {
  if (!checkIsDropboxReady()) {
    return;
  }
  loadSettingsFromDropboxLoading.value = true;
  const jsonObject = await downloadSettingsFromDropbox();
  const success = loadSettings(jsonObject);
  if (success) {
    message.success(t('page.settings.backup.settings_loaded'));
  }
  loadSettingsFromDropboxLoading.value = false;
}

async function processUploadBooksToDropbox(): Promise<void> {
  if (!checkIsDropboxReady()) {
    return;
  }
  uploadBooksToDropboxLoading.value = true;
  const books = await getAllBooksFromDb();
  await uploadBooksToDropbox(books);
  uploadBooksToDropboxLoading.value = false;
  message.success(t('page.settings.backup.books_uploaded', [books.length], books.length));
}

async function processDownloadBooksFromDropbox(): Promise<void> {
  if (!checkIsDropboxReady()) {
    return;
  }
  downloadBooksFromDropboxLoading.value = true;
  await (async () => {
    const jsonContent = await downloadBooksFromDropbox();
    const books = jsonContent ? parseBooksJson(jsonContent) : null;
    if (!books) {
      return;
    }
    if (!books.length) {
      message.warning(t('page.settings.backup.no_backed_up_books_on_dropbox'));
      return;
    }
    await putBooksToDb(books);
    message.success(t('page.settings.backup.book_imported', [books.length], books.length));
  })();
  downloadBooksFromDropboxLoading.value = false;
}

function zodErrorToMessages(zodError: ZodError, obj: unknown): string[] {
  return zodError.errors.map((error) => {
    const value = path(error.path, obj);
    return `Field: "${error.path.join('.')}"${isNil(value) ? '' : ` = ${value}`}. ${error.message}`;
  });
}

async function getFirstSelectedJsonFileContent(): Promise<object | null> {
  const files = await selectFile({ fileTypes: ['json'] });
  if (!Object.entries(files).length) {
    return null;
  }
  const jsonFile = Object.values(files)[0];
  return JSON.parse(await jsonFile.text());
}

function applyLanguageSetting(): void {
  const language = getSettingFromStorage(SettingKey.Language);
  if (!language || language === 'auto') {
    locale.value = navigator.language as typeof locale.value;
  } else {
    locale.value = language as typeof locale.value;
  }
}
</script>

<style lang="scss" scoped>
@import '../settings';
</style>
