<template>
  <div ref="dropTargetRef" class="page-content data-import-page">
    <FileDropZone v-if="!sqlFileLoaded" class="file-dropzone" :targetPath="targetFlePath" @fileDropped="onFile">
      Drop "KoboReader.sqlite" file or entire kobo storage here
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
      Drop file to re-import
    </FullPageFileDropZone>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useMessage, useNotification, useLoadingBar } from 'naive-ui';
import { sortWith, ascend, indexBy } from 'ramda';
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import FullPageFileDropZone from '@/component/FullPageFileDropZone/FullPageFileDropZone.vue';
import { KoboBookChanges, KoboBook, KoboBookmarkChanges, KoboBookmark, KoboBookmarkChangesType } from '@/dto/kobo-book';
import DataImportResult from '@/module/data-import/component/DataImportResult/DataImportResult.vue';
import { putBooksToDb, getAllBooksFromDb } from '@/services/bookmark/bookmark-manage.service';
import { createBookmarkPositionSortFn } from '@/services/bookmark/kobo-book-sort.service';
import { calcUpdatesOfBooks } from '@/services/bookmark/kobo-bookmark-compare.service';
import { getBooksFromSqliteFile } from '@/services/bookmark/kobo-bookmark.service';
import { deepToRaw } from '@/util/vue-utils';

const targetFlePath = '.kobo/KoboReader.sqlite';

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
    message.error(`No "KoboReader.sqlite" found in dropped files.`);
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
    notification.error({ title: 'Error when parsing bookmarks', content: (e as Error).message });
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
