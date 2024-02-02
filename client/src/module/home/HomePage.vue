<template>
  <div class="page-content home-page">
    <FileDropZone class="file-dropzone" targetPath=".kobo/KoboReader.sqlite" @fileDropped="onFile">
      Drop "KoboReader.sqlite" file or entire kobo storage here
    </FileDropZone>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

import FileDropZone from '@/component/FileDropZone/FileDropZone.vue';
import { getBooksFromSqliteFile } from '@/services/kobo-bookmark.service';
import { saveToStorage } from '@/util/storage-utils';

const router = useRouter();

async function onFile(files: Record<string, File>): Promise<void> {
  const sqliteFile = files['KoboReader.sqlite'] || files['.kobo/KoboReader.sqlite'];
  if (!sqliteFile) {
    return;
  }
  const allKoboBooks = await getBooksFromSqliteFile(sqliteFile);
  saveToStorage('books', allKoboBooks);
  await router.push('bookmarks');
}
</script>

<style lang="scss" scoped>
@import 'HomePage';
</style>
