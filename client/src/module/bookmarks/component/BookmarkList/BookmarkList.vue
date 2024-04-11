<template>
  <div class="bookmark-list">
    <BookmarkItem
      v-for="bookmark in bookmarksToShow"
      :key="bookmark.id"
      :bookmark="bookmark"
      :disabled="disabled"
      @onColorChanged="emits('onBookmarkColorChanged', bookmark, $event)"
      @onArchiveClick="emits('onBookmarkArchive', bookmark)"
      @onCancelArchiveClick="emits('onBookmarkCancelArchive', bookmark)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import BookmarkItem from '@/module/bookmarks/component/BookmarkItem/BookmarkItem.vue';
import { getSettingFromStorage } from '@/services/setting.service';

const props = defineProps<{ bookmarks: KoboBookmark[]; disabled?: boolean }>();
const emits = defineEmits<{
  (e: 'onBookmarkColorChanged', bookmark: KoboBookmark, color: HighlightColor): void;
  (e: 'onBookmarkArchive', value: KoboBookmark): void;
  (e: 'onBookmarkCancelArchive', value: KoboBookmark): void;
}>();

const bookmarksToShow = computed(() => {
  return getSettingFromStorage(SettingKey.ShowArchived)
    ? props.bookmarks
    : props.bookmarks.filter((bookmark) => bookmark.isArchived !== true);
});
</script>

<style lang="scss" scoped>
@import './BookmarkList';
</style>
