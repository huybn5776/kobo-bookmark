<template>
  <div class="bookmark-list">
    <BookmarkItem
      v-for="bookmark in bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      @onColorChanged="emits('onBookmarkColorChanged', bookmark, $event)"
      @onDeleteClick="emits('onBookmarkDelete', bookmark)"
    />
  </div>
</template>

<script lang="ts" setup>
import { KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import BookmarkItem from '@/module/bookmarks/component/BookmarkItem/BookmarkItem.vue';

defineProps<{ bookmarks: KoboBookmark[] }>();
const emits = defineEmits<{
  (e: 'onBookmarkColorChanged', bookmark: KoboBookmark, color: HighlightColor): void;
  (e: 'onBookmarkDelete', value: KoboBookmark): void;
}>();
</script>

<style lang="scss" scoped>
@import './BookmarkList';
</style>
