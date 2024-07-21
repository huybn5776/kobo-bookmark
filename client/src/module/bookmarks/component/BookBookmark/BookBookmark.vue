<template>
  <div ref="elementRef" class="book-bookmark" :class="{ 'book-selected': selected, 'book-expanded': expanded }">
    <BookItem
      v-if="!simple"
      selectable
      expandWithLink
      :book="book"
      :expanded="expanded"
      :disableBookmarkExpand="disableBookmarkExpand"
      :selected="selected"
      :enabledActions="enabledActions"
      :exportNotionLoading="exportNotionLoading"
      @update:expanded="emit('update:expanded', $event)"
      @update:selected="emit('update:selected', $event)"
      @textExportClick="emit('textExportClick', $event)"
      @markdownExportClick="emit('markdownExportClick', $event)"
      @notionExportClick="emit('notionExportClick', $event)"
      @bookStarClick="emit('bookStarClick', $event)"
      @bookCoverImageUpdated="emit('bookCoverImageUpdated', $event)"
      @bookArchiveClick="emit('bookArchiveClick', $event)"
      @shareClick="emit('shareClick', $event)"
      @bookCancelArchive="emit('bookCancelArchive', $event)"
      @bookInformationClick="emit('bookInformationClick', $event)"
    />
    <BookItemSimple v-if="simple" :book="book" :selected="selected" :stickyGap="stickyGap" />
    <BookmarkList
      v-if="(expanded && !disableBookmarkExpand) || simple"
      ref="bookmarkListRef"
      :book="book"
      :search="search"
      :disabled="!!book.isArchived"
      :readonly="readonly"
      :tagClickable="tagClickable"
      :tagRemovable="tagRemovable"
      class="book-bookmark-list"
      @tagClick="emit('bookmarkTagClick', $event)"
      @createBookmarkCardClick="emit('createBookmarkCardClick', book, $event)"
      @bookmarkUpdated="(bookmarkId, bookmarkPatch) => emit('bookmarkUpdated', book, bookmarkId, bookmarkPatch)"
      @bookmarkArchive="emit('bookmarkArchiveClick', book, $event)"
      @bookmarkCancelArchive="emit('bookmarkCancelArchiveClick', book, $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, ComponentInstance } from 'vue';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookAction } from '@/enum/book-action';
import BookItem from '@/module/bookmarks/component/BookItem/BookItem.vue';
import BookItemSimple from '@/module/bookmarks/component/BookItemSimple/BookItemSimple.vue';
import BookmarkList from '@/module/bookmarks/component/BookmarkList/BookmarkList.vue';

const props = defineProps<{
  book: KoboBook;
  expanded: boolean;
  defaultExpanded: boolean;
  selected: boolean;
  simple?: boolean;
  stickyGap?: number;
  search?: string;
  readonly?: boolean;
  tagClickable?: boolean;
  tagRemovable?: boolean;
  exportNotionLoading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void;
  (e: 'update:expanded', value: boolean): void;
  (e: 'textExportClick', value: KoboBook): void;
  (e: 'markdownExportClick', value: KoboBook): void;
  (e: 'notionExportClick', value: KoboBook): void;
  (e: 'bookStarClick', value: KoboBook): void;
  (e: 'bookCoverImageUpdated', value: string): void;
  (e: 'bookmarkTagClick', value: string): void;
  (e: 'bookArchiveClick', value: KoboBook): void;
  (e: 'bookCancelArchive', value: KoboBook): void;
  (e: 'shareClick', value: KoboBook): void;
  (e: 'createBookmarkCardClick', book: KoboBook, bookmark: KoboBookmark): void;
  (e: 'bookmarkUpdated', book: KoboBook, bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void;
  (e: 'bookmarkArchiveClick', book: KoboBook, bookmark: KoboBookmark): void;
  (e: 'bookmarkCancelArchiveClick', book: KoboBook, bookmark: KoboBookmark): void;
  (e: 'bookInformationClick', book: KoboBook): void;
}>();

const elementRef = ref<HTMLElement>();

const bookmarkListRef = ref<ComponentInstance<typeof BookmarkList>>();
defineExpose({ book: props.book, elementRef, scrollToBookmark });

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

function scrollToBookmark(bookmark: KoboBookmark, options?: ScrollIntoViewOptions): void {
  emit('update:expanded', true);
  bookmarkListRef.value?.focusToBookmark(bookmark, options);
}
</script>

<style lang="scss" scoped>
@import './BookBookmark';
</style>
