<template>
  <div class="delete-book-dialog-content">
    <p class="delete-book-dialog-text">
      Delete book
      <span>"</span>
      <b>{{ book.info.title }}</b>
      <span>"</span>
      <span v-if="book.bookmarks.length" class="delete-book-dialog-text">
        with <b>{{ book.bookmarks.length }}</b> {{ bookmarksWording }}
      </span>
      <span>?</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBook } from '@/dto/kobo-book';

const props = defineProps<{ book: KoboBook }>();
const bookmarksWording = computed(() => (props.book.bookmarks.length > 1 ? 'bookmarks' : 'bookmark'));
</script>

<style lang="scss" scoped>
@import './DeleteBookDialogContent';
</style>
