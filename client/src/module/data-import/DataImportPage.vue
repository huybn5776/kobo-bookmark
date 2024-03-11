<template>
  <div class="page-content data-import-page">
    <FileDropZone
      v-if="!sqlFileLoaded"
      class="file-dropzone"
      targetPath=".kobo/KoboReader.sqlite"
      @fileDropped="onFile"
    >
      Drop "KoboReader.sqlite" file or entire kobo storage here
    </FileDropZone>
    <DataImportResult
      v-if="sqlFileLoaded"
      :bookChanges="bookChanges"
      @onDiscardClick="discardChanges"
      @onSaveClick="saveChanges"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useMessage, useNotification, useLoadingBar } from 'naive-ui';
import { sortWith, ascend, indexBy } from 'ramda';
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import { KoboBookChanges, KoboBook } from '@/dto/kobo-book';
import DataImportResult from '@/module/data-import/component/DataImportResult/DataImportResult.vue';
import { putBooksToDb, getAllBooksFromDb } from '@/services/bookmark-manage.service';
import { createBookmarkPositionSortFn } from '@/services/kobo-book-sort.service';
import { calcUpdatesOfBooks } from '@/services/kobo-bookmark-compare.service';
import { getBooksFromSqliteFile } from '@/services/kobo-bookmark.service';
import { deepToRaw } from '@/util/vue-utils';

const router = useRouter();
const message = useMessage();
const notification = useNotification();
const loadingBar = useLoadingBar();

const sqlFileLoaded = ref(false);
const bookChanges = ref<KoboBookChanges[]>([]);
const importedBooks = ref<KoboBook[]>([]);

async function onFile(files: Record<string, File>): Promise<void> {
  const sqliteFile = findKoboReaderSqlFile(files);
  if (!sqliteFile) {
    message.error(`No "KoboReader.sqlite" found in dropped files.`);
    return;
  }
  loadingBar.start();
  try {
    const allKoboBooks = await getBooksFromSqliteFile(sqliteFile);
    const updates = calcUpdatesOfBooks(await getAllBooksFromDb(), allKoboBooks);
    importedBooks.value = allKoboBooks;
    bookChanges.value = updates;
    sqlFileLoaded.value = true;
    loadingBar.finish();
  } catch (e) {
    console.error(e);
    notification.error({ title: 'Error when parsing bookmarks', content: (e as Error).message });
    loadingBar.error();
  }
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
