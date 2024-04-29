<template>
  <div class="book-change-content">
    <div v-if="!bookChange.bookRemoved" class="book-changes-bookmark-changes-container">
      <BookmarkChanges
        v-for="bookmarkChanges of bookChange.changes"
        :key="bookmarkChanges.id"
        :bookmarkChanges="bookmarkChanges"
      />
    </div>
    <span v-if="bookChange.bookRemoved" class="book-removed-message">
      <i18n-t keypath="page.data_import.book_absent" />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { KoboBookChanges } from '@/dto/kobo-book';
import BookmarkChanges from '@/module/data-import/component/BookmarkChanges/BookmarkChanges.vue';

defineProps<{ bookChange: KoboBookChanges }>();
</script>

<style lang="scss" scoped>
@import './BookChanges';
</style>
