<template>
  <div class="book-changes">
    <div class="book-changes-header">
      <h2 class="book-changes-title">{{ bookChange.book.info.title }}</h2>
      <span class="book-changes-info">{{ changesText }}</span>
    </div>

    <div class="book-changes-bookmark-changes-container">
      <BookmarkChanges
        v-for="bookmarkChanges of bookChange.changes"
        :key="bookmarkChanges.id"
        :bookmarkChanges="bookmarkChanges"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBookChanges, KoboBookmarkChangesType } from '@/dto/kobo-book';
import BookmarkChanges from '@/module/data-import/component/BookmarkChanges/BookmarkChanges.vue';

const props = defineProps<{ bookChange: KoboBookChanges }>();

const changesText = computed(() => {
  const addedCount = countChangesOfType(KoboBookmarkChangesType.Added);
  const updatedCount = countChangesOfType(KoboBookmarkChangesType.Updated);
  const removedCount = countChangesOfType(KoboBookmarkChangesType.Removed);
  const texts = [
    ...(addedCount ? [`${addedCount} added`] : []),
    ...(updatedCount ? [`${updatedCount} updated`] : []),
    ...(removedCount ? [`${removedCount} removed`] : []),
  ];
  return texts.join(', ');
});

function countChangesOfType(type: KoboBookmarkChangesType): number {
  return props.bookChange.changes.filter((book) => book.type === type).length;
}
</script>

<style lang="scss" scoped>
@import './BookChanges';
</style>
