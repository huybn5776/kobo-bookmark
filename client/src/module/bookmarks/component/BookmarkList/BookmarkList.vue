<template>
  <div class="bookmark-list">
    <template v-for="{ bookmark, enabledActions } in bookmarksToShow" :key="bookmark.id">
      <BookmarkItem
        v-if="bookmark.id !== editingBookmarkId"
        ref="bookBookmarkRefs"
        :chapterIndexMap="chapterIndexMap"
        :bookmark="bookmark"
        :search="search"
        :enabledActions="enabledActions"
        :disabled="disabled"
        :readonly="readonly"
        @editClick="editingBookmarkId = bookmark.id"
        @createCardClick="emits('createBookmarkCardClick', bookmark)"
        @archiveClick="emits('bookmarkArchive', bookmark)"
        @cancelArchiveClick="emits('bookmarkCancelArchive', bookmark)"
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

import { KoboBookmark, KoboBook } from '@/dto/kobo-book';
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
}>();
const emits = defineEmits<{
  (e: 'bookmarkEditClick', bookmark: KoboBookmark): void;
  (e: 'bookmarkUpdated', bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): void;
  (e: 'createBookmarkCardClick', bookmark: KoboBookmark): void;
  (e: 'bookmarkArchive', value: KoboBookmark): void;
  (e: 'bookmarkCancelArchive', value: KoboBookmark): void;
}>();
defineExpose({ focusToBookmark });

const bookBookmarkRefs = ref<ComponentInstance<typeof BookmarkItem>[]>([]);
const editingBookmarkId = ref<string>();

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
  emits('bookmarkUpdated', bookmarkId, bookmarkPatch);
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
</script>

<style lang="scss" scoped>
@import './BookmarkList';
</style>
