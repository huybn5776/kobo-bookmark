<template>
  <div ref="elementRef" class="book-bookmark" :class="{ 'book-selected': selected, 'book-expanded': expanded }">
    <BookItem
      selectable
      :book="book"
      :expanded="expanded"
      :disableBookmarkExpand="disableBookmarkExpand"
      :selected="selected"
      :enabledActions="enabledActions"
      :exportNotionLoading="exportNotionLoading"
      @update:expanded="expanded = $event"
      @update:selected="emits('update:selected', $event)"
      @textExportClick="emits('textExportClick', $event)"
      @markdownExportClick="emits('markdownExportClick', $event)"
      @notionExportClick="emits('notionExportClick', $event)"
      @bookCoverImageUpdated="emits('bookCoverImageUpdated', $event)"
      @bookArchiveClick="emits('bookArchiveClick', $event)"
      @shareClick="emits('shareClick', $event)"
      @bookCancelArchive="emits('bookCancelArchive', $event)"
    />
    <BookmarkList
      v-if="expanded && !disableBookmarkExpand"
      ref="bookmarkListRef"
      :book="book"
      :focusBookmark="focusedBookmark"
      :search="search"
      :disabled="!!book.isArchived"
      :readonly="readonly"
      class="book-bookmark-list"
      @createBookmarkCardClick="emits('createBookmarkCardClick', book, $event)"
      @bookmarkUpdated="(bookmarkId, bookmarkPatch) => emits('bookmarkUpdated', book, bookmarkId, bookmarkPatch)"
      @bookmarkArchive="emits('bookmarkArchiveClick', book, $event)"
      @bookmarkCancelArchive="emits('bookmarkCancelArchiveClick', book, $event)"
      @focusToBookmarkEnd="focusedBookmark = undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookAction } from '@/enum/book-action';
import BookItem from '@/module/bookmarks/component/BookItem/BookItem.vue';
import BookmarkList from '@/module/bookmarks/component/BookmarkList/BookmarkList.vue';

const props = defineProps<{
  book: KoboBook;
  defaultExpanded: boolean;
  selected: boolean;
  search?: string;
  readonly?: boolean;
  exportNotionLoading?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:selected', value: boolean): void;
  (e: 'textExportClick', value: KoboBook): void;
  (e: 'markdownExportClick', value: KoboBook): void;
  (e: 'notionExportClick', value: KoboBook): void;
  (e: 'bookCoverImageUpdated', value: string): void;
  (e: 'bookArchiveClick', value: KoboBook): void;
  (e: 'bookCancelArchive', value: KoboBook): void;
  (e: 'shareClick', value: KoboBook): void;
  (e: 'createBookmarkCardClick', book: KoboBook, bookmark: KoboBookmark): void;
  (e: 'bookmarkUpdated', book: KoboBook, bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void;
  (e: 'bookmarkArchiveClick', book: KoboBook, bookmark: KoboBookmark): void;
  (e: 'bookmarkCancelArchiveClick', book: KoboBook, bookmark: KoboBookmark): void;
}>();

const elementRef = ref<HTMLElement>();

const expanded = ref<boolean>(false);
const bookmarkListRef = ref<InstanceType<typeof BookmarkList>>();
const focusedBookmark = ref<KoboBookmark>();
defineExpose({ elementRef, scrollToBookmark });

const enabledActions = computed<BookAction[]>(() => {
  if (props.readonly) {
    return [BookAction.ExportText, BookAction.ExportMarkdown, BookAction.ExportNotion];
  }
  if (props.book.isArchived) {
    return [BookAction.Archive];
  }
  return [
    BookAction.Archive,
    BookAction.DropboxShare,
    BookAction.ExportText,
    BookAction.ExportMarkdown,
    BookAction.ExportNotion,
  ];
});
const disableBookmarkExpand = computed(() => !props.book.bookmarks.length);

function scrollToBookmark(bookmark: KoboBookmark): void {
  expanded.value = true;
  focusedBookmark.value = bookmark;
}
</script>

<style lang="scss" scoped>
@import './BookBookmark';
</style>
