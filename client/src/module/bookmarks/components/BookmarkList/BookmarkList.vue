<template>
  <div class="bookmark-list">
    <BookmarkItem v-for="bookmark in bookmarks" :key="bookmark.id" :bookmark="bookmark" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { sortBy } from 'ramda';

import { KoboBookmark } from '@/dto/kobo-book';
import BookmarkItem from '@/module/bookmarks/components/BookmarkItem/BookmarkItem.vue';

const props = defineProps<{ bookmarks: KoboBookmark[] }>();
const bookmarks = computed(() => {
  return sortBy((bookmark) => bookmark.chapter.relatedChapters[0].index, props.bookmarks);
});
</script>

<style lang="scss" scoped>
@import './BookmarkList';
</style>
