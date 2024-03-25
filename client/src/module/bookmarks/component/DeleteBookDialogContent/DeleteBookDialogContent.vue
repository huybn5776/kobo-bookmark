<template>
  <div class="delete-book-dialog-content">
    <p class="delete-book-dialog-text">
      <i18n-t keypath="page.bookmarks.delete_book_with_bookmarks" :plural="book.bookmarks.length">
        <b>{{ book.info.title }}</b>
        <b>{{ book.bookmarks.length }}</b>
      </i18n-t>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { KoboBook } from '@/dto/kobo-book';

defineProps<{ book: KoboBook }>();
</script>

<style lang="scss" scoped>
@import './DeleteBookDialogContent';
</style>
