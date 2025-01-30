<template>
  <div class="page-content bookmark-share-page">
    <BookmarkShareView v-if="bookmarkShare" :bookmarkShare="bookmarkShare" />

    <BooksToolbar v-if="allBooks.length" :sticky="bookToolbarSticky">
      <MultiBookActionBar
        v-if="showMultiSelectToolbar"
        :readonly="!!bookmarkShare"
        :collectionFilterEnabled="false"
        :selectedBooks="selectedBooks"
        @textExportClick="exportSelectedAsText"
        @markdownExportClick="exportSelectedAsMarkdown"
        @exportBookFileClick="exportSelectedAsFile"
      />
      <div
        v-if="!showMultiSelectToolbar"
        class="bookmark-share-page-list-actions"
        :class="{ 'bookmark-share-page-list-actions-expanded': bookmarkSearchActive }"
      >
        <BookmarkSearch
          v-model:show="bookmarkSearchActive"
          v-model:search="bookmarkSearch"
          :books="allBooks"
          @selected="gotoBookmark"
        />
        <ToolbarPinToggle v-if="!bookmarkSearchActive" v-model:pin="toolbarPinned" />
      </div>
      <NCheckbox
        v-if="!bookmarkSearchActive"
        size="large"
        aria-label="check"
        :checked="selectedBooksCheckState === CheckboxState.Checked"
        :indeterminate="selectedBooksCheckState === CheckboxState.Indeterminate"
        @click="handleMasterCheckboxClick"
      />
      <BookSearchButton v-if="bookmarkSearchActive" @click="showBookSearchModal = true" />
    </BooksToolbar>

    <div v-if="allBooks.length" class="bookmark-share-books-container">
      <VirtualList
        ref="virtualListRef"
        v-slot="{ item: book }"
        :itemSize="213"
        :items="booksToShow"
        :keyField="'id'"
        :scrollableElement="scrollableElement"
        :focusItemKey="expandedBookId"
        :enabled="!expandedBookId"
      >
        <BookBookmark
          :ref="setBookBookmarkRef"
          :book="book"
          :expanded="expandedBookId === book.id"
          :defaultExpanded="booksToShow?.length === 1"
          :selected="selectedBookIds.includes(book.id)"
          :search="(bookmarkSearchActive && bookmarkSearch) || ''"
          :readonly="true"
          :exportNotionLoading="exportingBookIds.includes(book.id)"
          @update:expanded="onExpandedBookUpdated(book, $event)"
          @update:selected="(v) => onBookSelectChanges(book, v)"
          @textExportClick="exportBookmarkToText"
          @markdownExportClick="exportBookmarkToMarkdown"
          @notionExportClick="exportBookmarkToNotion"
          @createBookmarkCardClick="openBookmarkCardDialog"
        />
      </VirtualList>
    </div>

    <PageResult v-if="loadingBooks || pageResultMessage" :state="loadingBooks ? 'loading' : 'warning'">
      <i18n-t v-if="loadingBooks" keypath="page.bookmarks.loading_books" />
      <template v-if="pageResultMessage">{{ pageResultMessage }}</template>
    </PageResult>

    <Teleport v-if="showBookSearchModal" to="#app">
      <BookSearchModal
        :books="allBooks"
        @select="onBookModalSelect"
        @alterSelect="onBookModalAlterSelect"
        @close="showBookSearchModal = false"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, onMounted, computed } from 'vue';

import * as E from 'fp-ts/Either';
import { NCheckbox, useLoadingBar } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import BooksToolbar from '@/component/BooksToolbar/BooksToolbar.vue';
import PageResult from '@/component/PageResult/PageResult.vue';
import VirtualList from '@/component/VirtualList/VirtualList.vue';
import { useProvideAllBookmarkTags } from '@/composition/use-provide-all-bookmark-tags';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookmarkShare } from '@/dto/bookmark-share';
import { KoboBook } from '@/dto/kobo-book';
import { CheckboxState } from '@/enum/checkbox-state';
import { SettingKey } from '@/enum/setting-key';
import { useBookmarkCardDialog } from '@/module/bookmark-card-dialog/composition/use-bookmark-card-dialog';
import BookBookmark from '@/module/bookmarks/component/BookBookmark/BookBookmark.vue';
import BookmarkSearch from '@/module/bookmarks/component/BookmarkSearch/BookmarkSearch.vue';
import BookmarkShareView from '@/module/bookmarks/component/BookmarkShareView/BookmarkShareView.vue';
import BookSearchButton from '@/module/bookmarks/component/BookSearchButton/BookSearchButton.vue';
import BookSearchModal from '@/module/bookmarks/component/BookSearchModal/BookSearchModal.vue';
import MultiBookActionBar from '@/module/bookmarks/component/MultiBookActionBar/MultiBookActionBar.vue';
import ToolbarPinToggle from '@/module/bookmarks/component/ToolbarPinToggle/ToolbarPinToggle.vue';
import { useBookSearchModal } from '@/module/bookmarks/composition/use-book-search-modal';
import { useBookmarkExport } from '@/module/bookmarks/composition/use-bookmark-export';
import { useExpandedBook } from '@/module/bookmarks/composition/use-expanded-book';
import { useGoToBook } from '@/module/bookmarks/composition/use-go-to-book';
import { useMultiBookActions } from '@/module/bookmarks/composition/use-multi-book-actions';
import { getBookmarksShareFromDropboxShareId } from '@/services/dropbox/dropbox.service';

const { t } = useI18n<[I18NMessageSchema]>();

const route = useRoute();
const loadingBar = useLoadingBar();

const scrollableElement = document.getElementsByClassName('app')[0] as HTMLElement;

const bookmarkShare = ref<BookmarkShare>();
const loadingBooks = ref<boolean>(false);
const pageResultMessage = ref<string>();

const allBooks = ref<KoboBook[]>([]);
const bookmarkSearchActive = ref<boolean>(false);
const bookmarkSearch = ref<string>();
const toolbarPinned = useSyncSetting(SettingKey.BookmarksToolbarPinned);

const {
  books: booksToShow,
  expandedBookId,
  updateExpandedBookId,
  onExpandedBookUpdated,
} = useExpandedBook({ books: allBooks, setMessage });
const { virtualListRef, setBookBookmarkRef, gotoBook, gotoBookmark } = useGoToBook({
  booksToShow,
  expandedBookId,
  expandBook,
});
const { showBookSearchModal, onBookModalSelect, onBookModalAlterSelect } = useBookSearchModal({
  gotoBook,
  expandBook,
});
const { openBookmarkCardDialog } = useBookmarkCardDialog();
const {
  selectedBooks,
  selectedBookIds,
  selectedBooksCheckState,
  showMultiSelectToolbar,
  handleMasterCheckboxClick,
  onBookSelectChanges,
  exportSelectedAsText,
  exportSelectedAsMarkdown,
  exportSelectedAsFile,
} = useMultiBookActions({ allBooks: booksToShow, reloadBooks: loadBooks });
const { exportingBookIds, exportBookmarkToText, exportBookmarkToMarkdown, exportBookmarkToNotion } = useBookmarkExport({
  selectedBooks,
});
useProvideAllBookmarkTags({ allBooks });

const bookToolbarSticky = computed(
  () => showMultiSelectToolbar.value || bookmarkSearchActive.value || toolbarPinned.value || false,
);

onMounted(async () => {
  allBooks.value = [];
  bookmarkShare.value = undefined;
  pageResultMessage.value = undefined;

  await loadBooks();
});

watchEffect(() => (bookmarkSearchActive.value ? (selectedBooks.value = []) : undefined));
watchEffect(() => (selectedBooks.value.length ? (bookmarkSearchActive.value = false) : undefined));

watchEffect(() => {
  let message: string | undefined;
  if (allBooks.value.length && !booksToShow.value.length) {
    message = t('page.bookmarks.no_matching_bookmarks');
  } else {
    message = undefined;
  }
  pageResultMessage.value = message;
});

async function loadBooks(): Promise<void> {
  const shareId = route.params.shareId as string;
  if (shareId) {
    loadingBooks.value = true;
    loadingBar.start();
    await loadBooksFromShareId(shareId);
    loadingBooks.value = false;
    loadingBar.finish();
  } else {
    pageResultMessage.value = t('page.bookmarks.dropbox_bookmark_share_invalid_share_link');
  }
}

async function loadBooksFromShareId(shareId: string): Promise<void> {
  const result = await getBookmarksShareFromDropboxShareId(shareId);
  if (E.isLeft(result)) {
    pageResultMessage.value = t(result.left);
    return;
  }
  bookmarkShare.value = result.right;
  allBooks.value = bookmarkShare.value?.books;
}

function expandBook(bookId: string | undefined): void {
  updateExpandedBookId(bookId);
  if (bookId) {
    gotoBook(bookId);
  }
}

function setMessage(message: string): void {
  pageResultMessage.value = t(message);
}
</script>

<style lang="scss" scoped>
@import './BookmarkSharePage';
</style>
