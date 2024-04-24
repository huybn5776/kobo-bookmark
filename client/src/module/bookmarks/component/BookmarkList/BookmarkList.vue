<template>
  <div class="bookmark-list">
    <BookmarkItem
      v-for="{ bookmark, enabledActions } in bookmarksToShow"
      ref="bookBookmarkRefs"
      :key="bookmark.id"
      :bookmark="bookmark"
      :focused="bookmark === focusBookmark"
      :enabledActions="enabledActions"
      :disabled="disabled"
      :readonly="readonly"
      @onColorChanged="emits('bookmarkColorChanged', bookmark, $event)"
      @onCreateCardClick="emits('createBookmarkCardClick', bookmark)"
      @onArchiveClick="emits('bookmarkArchive', bookmark)"
      @onCancelArchiveClick="emits('bookmarkCancelArchive', bookmark)"
      @onHighlightAnimationEnd="emits('focusToBookmarkEnd', bookmark)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue';

import { KoboBookmark, KoboBook } from '@/dto/kobo-book';
import { BookmarkAction } from '@/enum/bookmark-action';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import BookmarkItem from '@/module/bookmarks/component/BookmarkItem/BookmarkItem.vue';
import { getSettingFromStorage } from '@/services/setting.service';
import { scrollToElementIfNotInView } from '@/util/dom-utils';

const props = defineProps<{
  book: KoboBook;
  focusBookmark?: KoboBookmark;
  disabled?: boolean;
  readonly?: boolean;
}>();
const emits = defineEmits<{
  (e: 'bookmarkColorChanged', bookmark: KoboBookmark, color: HighlightColor): void;
  (e: 'createBookmarkCardClick', bookmark: KoboBookmark): void;
  (e: 'bookmarkArchive', value: KoboBookmark): void;
  (e: 'bookmarkCancelArchive', value: KoboBookmark): void;
  (e: 'focusToBookmarkEnd', value: KoboBookmark): void;
}>();
const bookBookmarkRefs = ref<InstanceType<typeof BookmarkItem>[]>([]);

const bookmarksToShow = computed<{ bookmark: KoboBookmark; enabledActions: BookmarkAction[] }[]>(() => {
  const { book } = props;
  const bookmarks = getSettingFromStorage(SettingKey.ShowArchived)
    ? book.bookmarks
    : book.bookmarks.filter((bookmark) => bookmark.isArchived !== true);
  return bookmarks.map((bookmark) => {
    return {
      bookmark,
      enabledActions: calcBookmarkActions(book, bookmark),
    };
  });
});

onMounted(() => focusToBookmark(props.focusBookmark));
watch(
  () => props.focusBookmark?.id,
  () => focusToBookmark(props.focusBookmark),
);

function calcBookmarkActions(book: KoboBook, bookmark: KoboBookmark): BookmarkAction[] {
  if (props.book.isArchived) {
    return [];
  }
  if (bookmark.isArchived) {
    return [BookmarkAction.Archive];
  }
  if (props.readonly) {
    return [BookmarkAction.CreateCard];
  }
  return [BookmarkAction.Archive, BookmarkAction.CreateCard, BookmarkAction.ChangeColor];
}

function focusToBookmark(bookmark: KoboBookmark | undefined): void {
  if (!bookmark) {
    return;
  }
  const index = props.book.bookmarks.indexOf(bookmark);
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
