<template>
  <div class="bookmark-list">
    <BookmarkItem
      v-for="bookmark in bookmarksToShow"
      ref="bookBookmarkRefs"
      :key="bookmark.id"
      :bookmark="bookmark"
      :focused="bookmark === focusBookmark"
      :disabled="disabled"
      :readonly="readonly"
      @onColorChanged="emits('onBookmarkColorChanged', bookmark, $event)"
      @onCreateCardClick="emits('onCreateBookmarkCardClick', bookmark)"
      @onArchiveClick="emits('onBookmarkArchive', bookmark)"
      @onCancelArchiveClick="emits('onBookmarkCancelArchive', bookmark)"
      @onHighlightAnimationEnd="emits('onFocusToBookmarkEnd', bookmark)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue';

import { KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import BookmarkItem from '@/module/bookmarks/component/BookmarkItem/BookmarkItem.vue';
import { getSettingFromStorage } from '@/services/setting.service';
import { scrollToElementIfNotInView } from '@/util/dom-utils';

const props = defineProps<{
  bookmarks: KoboBookmark[];
  focusBookmark?: KoboBookmark;
  disabled?: boolean;
  readonly?: boolean;
}>();
const emits = defineEmits<{
  (e: 'onBookmarkColorChanged', bookmark: KoboBookmark, color: HighlightColor): void;
  (e: 'onCreateBookmarkCardClick', bookmark: KoboBookmark): void;
  (e: 'onBookmarkArchive', value: KoboBookmark): void;
  (e: 'onBookmarkCancelArchive', value: KoboBookmark): void;
  (e: 'onFocusToBookmarkEnd', value: KoboBookmark): void;
}>();
const bookBookmarkRefs = ref<InstanceType<typeof BookmarkItem>[]>([]);

const bookmarksToShow = computed(() => {
  return getSettingFromStorage(SettingKey.ShowArchived)
    ? props.bookmarks
    : props.bookmarks.filter((bookmark) => bookmark.isArchived !== true);
});

onMounted(() => focusToBookmark(props.focusBookmark));
watch(
  () => props.focusBookmark?.id,
  () => focusToBookmark(props.focusBookmark),
);

function focusToBookmark(bookmark: KoboBookmark | undefined): void {
  if (!bookmark) {
    return;
  }
  const index = props.bookmarks.indexOf(bookmark);
  const element = bookBookmarkRefs.value[index]?.elementRef;
  if (!element) {
    return;
  }
  scrollToElementIfNotInView(element);
}
</script>

<style lang="scss" scoped>
@import './BookmarkList';
</style>
