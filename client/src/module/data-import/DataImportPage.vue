<template>
  <div class="page-content data-import-page">
    <FileDropZone class="file-dropzone" targetPath=".kobo/KoboReader.sqlite" @fileDropped="onFile">
      Drop "KoboReader.sqlite" file or entire kobo storage here
    </FileDropZone>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import { putBooksToDb } from '@/services/bookmark-manage.service';
import { getBooksFromSqliteFile } from '@/services/kobo-bookmark.service';

const router = useRouter();

async function onFile(files: Record<string, File>): Promise<void> {
  const sqliteFile = files['KoboReader.sqlite'] || files['.kobo/KoboReader.sqlite'];
  if (!sqliteFile) {
    return;
  }
  const allKoboBooks = await getBooksFromSqliteFile(sqliteFile);
  await putBooksToDb(allKoboBooks);
  await router.push('bookmarks');
}
</script>

<style lang="scss" scoped>
@import './DataImportPage';
</style>
