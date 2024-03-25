<template>
  <div ref="dropTargetRef" class="page-content data-import-page">
    <FileDropZone v-if="!sqlFileLoaded" class="file-dropzone" :targetPath="targetFlePath" @fileDropped="onFile">
      <span>
        <i18n-t keypath="page.data_import.drop_file">
          <code>KoboReader.sqlite</code>
        </i18n-t>
      </span>
    </FileDropZone>
    <DataImportResult
      v-if="sqlFileLoaded"
      :bookChanges="bookChanges"
      @onDiscardClick="discardChanges"
      @onSaveClick="saveChanges"
    />
    <FullPageFileDropZone
      :dropTarget="dropTargetRef"
      :targetPath="targetFlePath"
      :enabled="sqlFileLoaded"
      @fileDropped="onFile"
    >
      <i18n-t keypath="page.data_import.drop_reimport" />
    </FullPageFileDropZone>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useMessage, useNotification, useLoadingBar } from 'naive-ui';
import { sortWith, ascend, indexBy } from 'ramda';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import FullPageFileDropZone from '@/component/FullPageFileDropZone/FullPageFileDropZone.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges, KoboBook, KoboBookmarkChanges, KoboBookmark, KoboBookmarkChangesType } from '@/dto/kobo-book';
import DataImportResult from '@/module/data-import/component/DataImportResult/DataImportResult.vue';
import { putBooksToDb, getAllBooksFromDb } from '@/services/bookmark/bookmark-manage.service';
import { createBookmarkPositionSortFn } from '@/services/bookmark/kobo-book-sort.service';
import { calcUpdatesOfBooks } from '@/services/bookmark/kobo-bookmark-compare.service';
import { getBooksFromSqliteFile } from '@/services/bookmark/kobo-bookmark.service';
import { deepToRaw } from '@/util/vue-utils';

const targetFlePath = '.kobo/KoboReader.sqlite';

const { t } = useI18n<[I18NMessageSchema]>();
const router = useRouter();
const message = useMessage();
const notification = useNotification();
const loadingBar = useLoadingBar();

const dropTargetRef = ref<HTMLElement>();
const sqlFileLoaded = ref(false);
const bookChanges = ref<KoboBookChanges[]>([]);
const importedBooks = ref<KoboBook[]>([]);

async function onFile(files: Record<string, File>): Promise<void> {
  const sqliteFile = findKoboReaderSqlFile(files);
  if (!sqliteFile) {
    message.error(t('page.data_import.no_sql_file'));
    return;
  }
  loadingBar.start();
  try {
    const allKoboBooks = await getBooksFromSqliteFile(sqliteFile);
    let updates = calcUpdatesOfBooks(await getAllBooksFromDb(), allKoboBooks);
    updates = sortUpdatesBookmarksByPosition(updates);
    importedBooks.value = allKoboBooks;
    bookChanges.value = updates;
    sqlFileLoaded.value = true;
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
  sqlFileLoaded.value = false;
  bookChanges.value = [];
  importedBooks.value = [];
}

async function saveChanges(): Promise<void> {
  if (!importedBooks.value) {
    return;
  }
  const originalBooks = await getAllBooksFromDb();
  const originalBooksIndex = indexBy((book) => book.id, originalBooks);
  const currentBooks = deepToRaw(importedBooks.value);
  const booksToSave = currentBooks.map((book) => {
    const originalBook = originalBooksIndex[book.id];
    return originalBook ? { ...originalBook, ...book } : book;
  });
  await putBooksToDb(booksToSave);
  await router.push('bookmarks');
}

function findKoboReaderSqlFile(files: Record<string, File>): File | null {
  if (Object.entries(files).length === 1 && Object.keys(files)[0].endsWith('.sqlite')) {
    return Object.values(files)[0];
  }
  return files['KoboReader.sqlite'] || files['.kobo/KoboReader.sqlite'] || null;
}
</script>

<style lang="scss" scoped>
@import './DataImportPage';
</style>
