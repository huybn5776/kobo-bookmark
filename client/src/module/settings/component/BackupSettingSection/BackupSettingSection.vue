<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.backup.title" />
    </h3>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.backup.title_setting_value" />
      </p>
      <NButton @click="exportAllSettings">
        <i18n-t keypath="page.settings.backup.export_all_settings" />
      </NButton>
      <NButton @click="importSettings">
        <i18n-t keypath="page.settings.backup.import_settings" />
      </NButton>
      <NButton @click="clearSettings">
        <i18n-t keypath="page.settings.backup.reset_all_settings" />
      </NButton>
    </div>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.backup.title_book_and_bookmarks" />
      </p>
      <NButton @click="exportAllBooks">
        <i18n-t keypath="page.settings.backup.export_all_books" />
      </NButton>
      <NButton @click="importBooks">
        <i18n-t keypath="page.settings.backup.import_books" />
      </NButton>
      <NButton @click="clearBooks">
        <i18n-t keypath="page.settings.backup.clear_all_books" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { h } from 'vue';

import { NButton, useMessage, useNotification, useDialog } from 'naive-ui';
import { path, isNil } from 'ramda';
import { useI18n } from 'vue-i18n';
import { ZodError } from 'zod';

import MultiLineText from '@/component/MultiLineText/MultiLineText.vue';
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
  saveSettingToStorage,
  getSettingValues,
  getSettingFromStorage,
  deleteAllSettingFromStorage,
} from '@/services/setting.service';
import { saveDataToJsonFile, selectFile } from '@/util/file-utils';
import { isNotNilOrEmpty } from '@/util/object-utils';

const { t, locale } = useI18n<[I18NMessageSchema]>();

const message = useMessage();
const notification = useNotification();
const dialog = useDialog();

const { parseBooksJson } = useParseKoboBooksJson();

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
  if (Array.isArray(jsonObject)) {
    notification.error({
      title: t('page.settings.backup.fail_to_import_settings'),
      content: t('page.settings.backup.data_structure_error'),
    });
    return;
  }
  let settingValues: SettingValueType;
  try {
    settingValues = settingValueSchema.parse(jsonObject) as SettingValueType;
  } catch (e) {
    handleSettingSchemaParseError(e as ZodError, jsonObject as SettingValueType);
    return;
  }

  for (const key of Object.values(SettingKey)) {
    const value = settingValues[key];
    if (isNotNilOrEmpty(value)) {
      saveSettingToStorage(key, value, SettingEventType.Backup);
    }
  }
  applyLanguageSetting();

  message.success(t('page.settings.backup.setting_applied'));
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
  });
}

async function exportAllBooks(): Promise<void> {
  const books = await getAllBooksFromDb();
  saveDataToJsonFile(books, { fileName: 'kobo-books' });
}

async function importBooks(): Promise<void> {
  notification.destroyAll();

  const files = await selectFile({ fileType: 'json' });
  if (!Object.entries(files).length) {
    return;
  }
  const jsonFile = Object.values(files)[0];
  const jsonContent = await jsonFile.text();
  const books = await parseBooksJson(jsonContent);
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
  });
}

function zodErrorToMessages(zodError: ZodError, obj: unknown): string[] {
  return zodError.errors.map((error) => {
    const value = path(error.path, obj);
    return `Field: "${error.path.join('.')}"${isNil(value) ? '' : ` = ${value}`}. ${error.message}`;
  });
}

async function getFirstSelectedJsonFileContent(): Promise<object | null> {
  const files = await selectFile({ fileType: 'json' });
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
