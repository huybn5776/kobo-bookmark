<template>
  <div class="delete-multi-book-dialog-content">
    <p class="delete-multi-book-dialog-text">
      <i18n-t keypath="page.bookmarks.delete_multi_books" :plural="books.length">
        <b>{{ books.length }}</b>
      </i18n-t>
    </p>
    <ul class="delete-multi-book-dialog-book-list">
      <li v-for="book of books" :key="book.id">{{ book.info.title }}</li>
    </ul>
    <p class="delete-multi-book-dialog-text">
      <i18n-t keypath="page.bookmarks.with_bookmarks" :plural="totalBookmarks">
        <b>{{ totalBookmarks }}</b>
      </i18n-t>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBook } from '@/dto/kobo-book';

const props = defineProps<{ books: KoboBook[] }>();
const totalBookmarks = computed(() => props.books.reduce((total, book) => total + book.bookmarks.length, 0));
</script>

<style lang="scss" scoped>
@forward './DeleteMultiBookDialogContent';
</style>
