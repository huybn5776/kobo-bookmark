<template>
  <div ref="dropTargetRef" class="page-content data-import-page">
    <FileDropZone
      v-if="!targetFileLoaded"
      class="file-dropzone"
      :targetPath="targetFlePath"
      @fileDropped="onFile"
      @click="selectFileToImport"
    >
      <span>
        <i18n-t keypath="page.data_import.drop_file">
          <code>KoboReader.sqlite/Kobo.sqlite</code>
        </i18n-t>
      </span>
    </FileDropZone>
    <DataImportResult
      v-if="targetFileLoaded"
      :bookChanges="bookChanges"
      @exportTextFileClick="exportChangeAsTextFile"
      @exportTextClipboardClick="exportChangeAsTextClipboard"
      @exportMarkdownFileClick="exportChangeAsMarkdownFile"
      @exportMarkdownClipboardClick="exportChangeAsMarkdownClipboard"
      @discardClick="discardChanges"
      @saveClick="saveChanges"
    />
    <FullPageFileDropZone
      :dropTarget="dropTargetRef"
      :targetPath="targetFlePath"
      :enabled="targetFileLoaded"
      @fileDropped="onFile"
    >
      <i18n-t keypath="page.data_import.drop_reimport" />
    </FullPageFileDropZone>
    <ImportDataInstruction v-if="!targetFileLoaded" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useMessage, useNotification, useLoadingBar } from 'naive-ui';
import { sortWith, ascend } from 'ramda';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import FullPageFileDropZone from '@/component/FullPageFileDropZone/FullPageFileDropZone.vue';
import { useParseKoboBooksJson } from '@/composition/use-parse-kobo-books-json';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges, KoboBook, KoboBookmarkChanges, KoboBookmark, KoboBookmarkChangesType } from '@/dto/kobo-book';
import { SettingEventType } from '@/enum/setting-event-type';
import { SettingKey } from '@/enum/setting-key';
import DataImportResult from '@/module/data-import/component/DataImportResult/DataImportResult.vue';
import ImportDataInstruction from '@/module/data-import/component/ImportDataInstruction/ImportDataInstruction.vue';
import { useExportChanges } from '@/module/data-import/composition/use-export-changes';
import { getAllBooksFromDb, upsertBook } from '@/services/bookmark/bookmark-manage.service';
import { createBookmarkPositionSortFn } from '@/services/bookmark/kobo-book-sort.service';
import { calcUpdatesOfBooks, updateImportedAtFromChanges } from '@/services/bookmark/kobo-bookmark-compare.service';
import { getBooksFromSqliteFile } from '@/services/bookmark/kobo-bookmark.service';
import { saveSettingToStorage } from '@/services/setting.service';
import { readBlobAsText } from '@/util/browser-utils';
import { selectFile } from '@/util/file-utils';
import { deepToRaw } from '@/util/vue-utils';

const targetFlePath = '.kobo/KoboReader.sqlite';

const { t } = useI18n<[I18NMessageSchema]>();
const router = useRouter();
const message = useMessage();
const notification = useNotification();
const loadingBar = useLoadingBar();

const dropTargetRef = ref<HTMLElement>();
const targetFileLoaded = ref(false);
const bookChanges = ref<KoboBookChanges[]>([]);
const importedBooks = ref<KoboBook[]>([]);

const {
  exportChangeAsTextFile,
  exportChangeAsTextClipboard,
  exportChangeAsMarkdownFile,
  exportChangeAsMarkdownClipboard,
} = useExportChanges({ bookChanges });
const { parseBooksJson } = useParseKoboBooksJson();

function selectFileToImport(): void {
  selectFile({ fileTypes: ['sqlite', 'json'] }).then(onFile);
}

async function onFile(files: Record<string, File>): Promise<void> {
  targetFileLoaded.value = false;
  bookChanges.value = [];
  importedBooks.value = [];
  notification.destroyAll();

  const targetFile = findSqliteFromFile(files) || findJsonFromFiles(files);
  if (!targetFile) {
    message.error(t('page.data_import.no_target_file'));
    return;
  }
  loadingBar.start();
  try {
    const allKoboBooks = await parseBooksFromFile(targetFile);
    if (!allKoboBooks) {
      loadingBar.finish();
      return;
    }
    let updates = calcUpdatesOfBooks(await getAllBooksFromDb(), allKoboBooks);
    updates = sortUpdatesBookmarksByPosition(updates);
    importedBooks.value = allKoboBooks;
    bookChanges.value = updates;
    targetFileLoaded.value = true;
    loadingBar.finish();
  } catch (e) {
    console.error(e);
    notification.error({ title: t('page.data_import.error_parsing'), content: (e as Error).message });
    loadingBar.error();
  }
}

function sortUpdatesBookmarksByPosition(updates: KoboBookChanges[]): KoboBookChanges[] {
  return updates.map((update) => {
    if (update.bookFileChanged && update.changes.some((change) => change.type === KoboBookmarkChangesType.Removed)) {
      return update;
    }
    const sortedChanges = sortWith(
      [
        createBookmarkPositionSortFn((c) => c.original || c.current),
        ascend<KoboBookmarkChanges>((c) => ((c.original || c.current) as KoboBookmark).startContainerPath),
        ascend<KoboBookmarkChanges>((change) => change.type),
      ],
      update.changes,
    );
    return { ...update, changes: sortedChanges };
  });
}

function discardChanges(): void {
  targetFileLoaded.value = false;
  bookChanges.value = [];
  importedBooks.value = [];
}

async function saveChanges(): Promise<void> {
  if (!importedBooks.value) {
    return;
  }
  let booksToSave = deepToRaw(importedBooks.value);
  booksToSave = updateImportedAtFromChanges(booksToSave, bookChanges.value);
  for (const book of booksToSave) {
    await upsertBook(deepToRaw(book));
  }
  saveSettingToStorage(
    SettingKey.LastImportState,
    { books: bookChanges.value.map((c) => c.book.id), importedAt: Date.now() },
    SettingEventType.User,
  );
  await router.push('bookmarks');
}

function findSqliteFromFile(files: Record<string, File>): File | null {
  if (Object.entries(files).length === 1 && Object.keys(files)[0].endsWith('.sqlite')) {
    return Object.values(files)[0] || null;
  }
  return files['KoboReader.sqlite'] || files['.kobo/KoboReader.sqlite'] || null;
}

function findJsonFromFiles(files: Record<string, File>): File | null {
  if (Object.entries(files).length === 1 && Object.keys(files)[0].endsWith('.json')) {
    return Object.values(files)[0];
  }
  return null;
}

async function parseBooksFromFile(file: File): Promise<KoboBook[] | null> {
  if (file.name.endsWith('.sqlite')) {
    return getBooksFromSqliteFile(file);
  }
  if (file.name.endsWith('.json')) {
    const jsonContent = await readBlobAsText(file);
    return parseBooksJson(jsonContent);
  }
  return null;
}
</script>

<style lang="scss" scoped>
@import './DataImportPage';
</style>
