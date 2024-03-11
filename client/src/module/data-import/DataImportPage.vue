<template>
  <div class="page-content data-import-page">
    <FileDropZone class="file-dropzone" targetPath=".kobo/KoboReader.sqlite" @fileDropped="onFile">
      Drop "KoboReader.sqlite" file or entire kobo storage here
    </FileDropZone>
  </div>
</template>

<script lang="ts" setup>
import { useMessage, useNotification, useLoadingBar } from 'naive-ui';
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import { putBooksToDb } from '@/services/bookmark-manage.service';
import { getBooksFromSqliteFile } from '@/services/kobo-bookmark.service';

const router = useRouter();
const message = useMessage();
const notification = useNotification();
const loadingBar = useLoadingBar();

async function onFile(files: Record<string, File>): Promise<void> {
  const sqliteFile = findKoboReaderSqlFile(files);
  if (!sqliteFile) {
    message.error(`No "KoboReader.sqlite" found in dropped files.`);
    return;
  }
  loadingBar.start();
  try {
    const allKoboBooks = await getBooksFromSqliteFile(sqliteFile);
    await putBooksToDb(allKoboBooks);
    loadingBar.finish();
    await router.push('bookmarks');
  } catch (e) {
    console.error(e);
    notification.error({ title: 'Error when parsing bookmarks', content: (e as Error).message });
    loadingBar.error();
  }
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
