<template>
  <div class="bookmark-list">
    <template v-for="{ bookmark, enabledActions } in bookmarksToShow" :key="bookmark.id">
      <BookmarkItem
        v-if="bookmark.id !== editingBookmarkId"
        ref="bookBookmarkRefs"
        :chapterIndexMap="chapterIndexMap"
        :bookmark="bookmark"
        :showChapter="bookmarkChapterVisibleMap[bookmark.id]"
        :search="search"
        :editingTag="editingTagBookmarkId === bookmark.id"
        :enabledActions="enabledActions"
        :tagClickable="tagClickable"
        :tagRemovable="tagRemovable"
        @editClick="editingBookmarkId = bookmark.id"
        @createCardClick="emit('createBookmarkCardClick', bookmark)"
        @archiveClick="emit('bookmarkArchive', bookmark)"
        @cancelArchiveClick="emit('bookmarkCancelArchive', bookmark)"
        @tagClick="emit('tagClick', $event)"
        @tagEditClick="toggleEditingTagBookmark(bookmark)"
        @finishEditingTag="editingTagBookmarkId = undefined"
        @tagUpdated="updateBookmarkTag(bookmark, $event)"
      />
      <BookmarkEditItem
        v-if="bookmark.id === editingBookmarkId"
        :book="book"
        :chapterIndexMap="chapterIndexMap"
        :bookmark="bookmark"
        @cancel="cancelBookmarkEdit"
        @save="saveBookmark"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, ComponentInstance } from 'vue';

import { useEventListener } from '@vueuse/core';

import { KoboBookmark, KoboBook, KoboBookmarkTag } from '@/dto/kobo-book';
import { BookmarkAction } from '@/enum/bookmark-action';
import { SettingKey } from '@/enum/setting-key';
import BookmarkEditItem from '@/module/bookmarks/component/BookmarkEditItem/BookmarkEditItem.vue';
import BookmarkItem from '@/module/bookmarks/component/BookmarkItem/BookmarkItem.vue';
import { getChapterIndexMap } from '@/services/bookmark/kobo-bookmark.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { scrollToElementIfNotInView } from '@/util/dom-utils';

const props = defineProps<{
  book: KoboBook;
  search?: string;
  disabled?: boolean;
  readonly?: boolean;
  showAllBookmarks?: boolean;
  tagClickable?: boolean;
  tagRemovable?: boolean;
}>();
const emit = defineEmits<{
  (e: 'bookmarkEditClick', bookmark: KoboBookmark): void;
  (e: 'bookmarkUpdated', bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void;
  (e: 'createBookmarkCardClick', bookmark: KoboBookmark): void;
  (e: 'bookmarkArchive', value: KoboBookmark): void;
  (e: 'bookmarkCancelArchive', value: KoboBookmark): void;
  (e: 'tagClick', value: string): void;
}>();
defineExpose({ focusToBookmark });

const bookBookmarkRefs = ref<ComponentInstance<typeof BookmarkItem>[]>([]);
const editingBookmarkId = ref<string>();
const editingTagBookmarkId = ref<string>();

const bookmarksToShow = computed<{ bookmark: KoboBookmark; enabledActions: BookmarkAction[] }[]>(() => {
  const { book } = props;
  const bookmarks =
    props.showAllBookmarks || getSettingFromStorage(SettingKey.ShowArchived)
      ? book.bookmarks
      : book.bookmarks.filter((bookmark) => bookmark.isArchived !== true);
  return bookmarks.map((bookmark) => {
    return {
      bookmark,
      enabledActions: calcBookmarkActions(book, bookmark),
    };
  });
});

const chapterIndexMap = computed(() => getChapterIndexMap(props.book.chapters));
const bookmarkChapterVisibleMap = computed<Record<string, boolean>>(() => {
  const result: Record<string, boolean> = {};
  const showedChapterIndex = new Set<number>();
  for (const bookmark of props.book.bookmarks) {
    const chapterIndex = bookmark.chapter.relatedChapterIndexes[0];
    if (showedChapterIndex.has(chapterIndex)) {
      result[bookmark.id] = false;
    } else {
      result[bookmark.id] = true;
      showedChapterIndex.add(chapterIndex);
    }
  }
  return result;
});

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (!editingTagBookmarkId.value) {
    return;
  }
  if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.code === 'Escape') {
    editingTagBookmarkId.value = undefined;
  }
});

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
  return [BookmarkAction.Archive, BookmarkAction.CreateCard, BookmarkAction.Edit];
}

function cancelBookmarkEdit(): void {
  editingBookmarkId.value = undefined;
}

function saveBookmark(bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void {
  emit('bookmarkUpdated', bookmarkId, bookmarkPatch);
  editingBookmarkId.value = undefined;
}

function focusToBookmark(bookmark: KoboBookmark | undefined, options?: ScrollIntoViewOptions): void {
  if (!bookmark) {
    return;
  }
  const index = props.book.bookmarks.indexOf(bookmark);
  const bookBookmarkRef = bookBookmarkRefs.value[index];
  if (!bookBookmarkRef?.elementRef) {
    return;
  }
  scrollToElementIfNotInView(bookBookmarkRef.elementRef, options);
  bookBookmarkRef.runHighlightAnimationWhenVisible();
}

function toggleEditingTagBookmark(bookmark: KoboBookmark): void {
  if (editingTagBookmarkId.value === bookmark.id) {
    editingTagBookmarkId.value = undefined;
  } else {
    editingTagBookmarkId.value = bookmark.id;
  }
}

function updateBookmarkTag(bookmark: KoboBookmark, tags: KoboBookmarkTag[]): void {
  const updatedBookmark: KoboBookmark = { ...bookmark };
  updatedBookmark.tags = tags;
  emit('bookmarkUpdated', updatedBookmark.id, updatedBookmark);
  editingTagBookmarkId.value = undefined;
}
</script>

<style lang="scss" scoped>
@forward './BookmarkList';
</style>
