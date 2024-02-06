<template>
  <div class="bookmark-list">
    <BookmarkItem v-for="bookmark in bookmarks" :key="bookmark.id" :bookmark="bookmark" />
  </div>
</template>

<script lang="ts" setup>
import { KoboBookmark } from '@/dto/kobo-book';
import BookmarkItem from '@/module/bookmarks/components/BookmarkItem/BookmarkItem.vue';

defineProps<{ bookmarks: KoboBookmark[] }>();
</script>

<style lang="scss" scoped>
@import './BookmarkList';
</style>
