<template>
  <div class="page-content bookmark-page">
    <BookmarkShareView v-if="bookmarkShare" :bookmarkShare="bookmarkShare" />

    <div
      v-if="allBooks.length"
      class="bookmark-page-tools"
      :class="{ 'bookmark-page-tools-sticky': showMultiSelectToolbar || bookmarkSearchActive || toolbarPinned }"
    >
      <MultiBookActionBar
        v-if="showMultiSelectToolbar"
        :readonly="!!bookmarkShare"
        :collectionFilterEnabled="!!bookCollectionIdFilter"
        :selectedBooks="selectedBooks"
        @textExportClick="exportSelectedAsText"
        @markdownExportClick="exportSelectedAsMarkdown"
        @notionExportClick="exportSelectedToNotion"
        @exportBookFileClick="exportSelectedAsFile"
        @addToCollectionClick="addSelectionToCollection"
        @removeFromCollectionClick="removeSelectionFromCollection"
        @archiveClick="archiveSelected"
        @deleteClick="deleteSelected"
        @shareClick="openShareBooksWithDropboxDialog(selectedBooks)"
      />
      <div
        v-if="!showMultiSelectToolbar"
        class="bookmark-list-actions"
        :class="{ 'bookmark-list-actions-expanded': bookmarkSearchActive }"
      >
        <BookmarkSearch
          v-model:show="bookmarkSearchActive"
          v-model:search="bookmarkSearch"
          :books="filteredBooks"
          @selected="gotoBookmark"
        />
        <ToolbarPinToggle v-if="!bookmarkSearchActive" v-model:pin="toolbarPinned" />
        <BookmarkFilterDropdown
          v-if="!bookmarkSearchActive"
          v-model:collection="bookCollectionIdFilter"
          v-model:colors="highlightColorFilter"
          :disabled="!allBooks.length"
          @createCollectionClick="handleCreateCollection"
          @editCollectionClick="handleEditCollection"
        />
        <BookmarkSortingDropdown
          v-if="!bookmarkSearchActive"
          v-model:bookSortingPriority="bookSortingPriority"
          v-model:bookSorting="bookSorting"
          v-model:bookmarkSorting="bookmarkSorting"
          :disabled="!!bookCollectionIdFilter"
        />
      </div>
      <NCheckbox
        v-if="!bookmarkSearchActive"
        size="large"
        :checked="selectedBooksCheckState === CheckboxState.Checked"
        :indeterminate="selectedBooksCheckState === CheckboxState.Indeterminate"
        @click="handleMasterCheckboxClick"
      />
      <BookSearchButton v-if="bookmarkSearchActive" @click="showBookSearchModal = true" />
    </div>

    <ActiveBookCollectionView :bookCollection="activeBookCollection" @closeClick="bookCollectionIdFilter = undefined" />

    <div v-if="allBooks.length" class="books-container">
      <VirtualList
        ref="virtualListRef"
        v-slot:default="{ item: book }"
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
          :readonly="!!bookmarkShare"
          :exportNotionLoading="exportingBookIds.includes(book.id)"
          @update:expanded="onExpandedBookUpdated(book, $event)"
          @update:selected="(v) => onBookSelectChanges(book, v)"
          @textExportClick="exportBookmarkToText"
          @markdownExportClick="exportBookmarkToMarkdown"
          @notionExportClick="exportBookmarkToNotion"
          @bookStarClick="toggleBookStar"
          @bookCoverImageUpdated="(v) => updateBookCoverImage(book, v)"
          @bookArchiveClick="archiveBook"
          @shareClick="openShareBooksWithDropboxDialog([book])"
          @bookCancelArchive="cancelArchiveBook"
          @bookmarkUpdated="updateBookmark"
          @createBookmarkCardClick="openBookmarkCardDialog"
          @bookmarkArchiveClick="archiveBookmark"
          @bookmarkCancelArchiveClick="cancelArchiveBookmark"
        />
      </VirtualList>
    </div>

    <PageResult v-if="loadingBooks || pageResultMessage" :state="loadingBooks ? 'loading' : 'warning'">
      <i18n-t v-if="loadingBooks" keypath="page.bookmarks.loading_books" />
      <template v-if="pageResultMessage">{{ pageResultMessage }}</template>
    </PageResult>

    <EmptyBookmarksView v-if="!loadingBooks && !pageResultMessage && !allBooks.length" />

    <Teleport v-if="!!bookExportTasksToShow.length" to="#app">
      <BookExportProgressModal
        :tasks="bookExportTasksToShow"
        @taskClick="gotoBook($event.book.id)"
        @cancelTask="cancelTask"
        @discardAllTasks="discardAllTasks"
      />
    </Teleport>
    <Teleport v-if="showBookSearchModal" to="#app">
      <BookSearchModal
        :books="filteredBooks"
        @select="onBookModalSelect"
        @alterSelect="onBookModalAlterSelect"
        @close="showBookSearchModal = false"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, watch, onMounted, ComponentInstance, ComponentPublicInstance, nextTick } from 'vue';

import * as E from 'fp-ts/Either';
import { NCheckbox, useLoadingBar } from 'naive-ui';
import { isNil } from 'ramda';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import PageResult from '@/component/PageResult/PageResult.vue';
import VirtualList from '@/component/VirtualList/VirtualList.vue';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookmarkShare } from '@/dto/bookmark-share';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { CheckboxState } from '@/enum/checkbox-state';
import { SettingKey } from '@/enum/setting-key';
import { useBookmarkCardDialog } from '@/module/bookmark-card-dialog/composition/use-bookmark-card-dialog';
import ActiveBookCollectionView from '@/module/bookmarks/component/ActiveBookCollectionView/ActiveBookCollectionView.vue';
import BookBookmark from '@/module/bookmarks/component/BookBookmark/BookBookmark.vue';
import BookExportProgressModal from '@/module/bookmarks/component/BookExportProgressModal/BookExportProgressModal.vue';
import BookmarkFilterDropdown from '@/module/bookmarks/component/BookmarkFilterDropdown/BookmarkFilterDropdown.vue';
import BookmarkSearch from '@/module/bookmarks/component/BookmarkSearch/BookmarkSearch.vue';
import BookmarkShareView from '@/module/bookmarks/component/BookmarkShareView/BookmarkShareView.vue';
import BookmarkSortingDropdown from '@/module/bookmarks/component/BookmarkSortingDropdown/BookmarkSortingDropdown.vue';
import BookSearchButton from '@/module/bookmarks/component/BookSearchButton/BookSearchButton.vue';
import BookSearchModal from '@/module/bookmarks/component/BookSearchModal/BookSearchModal.vue';
import EmptyBookmarksView from '@/module/bookmarks/component/EmptyBookmarksView/EmptyBookmarksView.vue';
import MultiBookActionBar from '@/module/bookmarks/component/MultiBookActionBar/MultiBookActionBar.vue';
import ToolbarPinToggle from '@/module/bookmarks/component/ToolbarPinToggle/ToolbarPinToggle.vue';
import { useBookBookmarkArchive } from '@/module/bookmarks/composition/use-book-bookmark-archive';
import { useBookFilter } from '@/module/bookmarks/composition/use-book-filter';
import { useBookSearchModal } from '@/module/bookmarks/composition/use-book-search-modal';
import { useBookSorting } from '@/module/bookmarks/composition/use-book-sorting';
import { useBookmarkExport } from '@/module/bookmarks/composition/use-bookmark-export';
import { useExpandedBook } from '@/module/bookmarks/composition/use-expanded-book';
import { useManageBookCollection } from '@/module/bookmarks/composition/use-manage-book-collection';
import { useMultiBookActions } from '@/module/bookmarks/composition/use-multi-book-actions';
import { useShareBookDialog } from '@/module/bookmarks/composition/use-share-book-dialog';
import { useUpdateBook } from '@/module/bookmarks/composition/use-update-book';
import { findCoverImageForBook } from '@/services/bookmark/book-cover.service';
import { getBooksFromDb, putBooksToDb, updateBookmarkByPatch } from '@/services/bookmark/bookmark-manage.service';
import { getBookmarksShareFromDropboxShareId } from '@/services/dropbox/dropbox.service';
import { deepToRaw } from '@/util/vue-utils';

const { t } = useI18n<[I18NMessageSchema]>();

const route = useRoute();
const loadingBar = useLoadingBar();

const scrollableElement = document.getElementsByClassName('app')[0] as HTMLElement;

const virtualListRef = ref<ComponentInstance<typeof VirtualList<KoboBook, 'id'>>>();
const bookmarkShare = ref<BookmarkShare>();
const loadingBooks = ref<boolean>(false);
const pageResultMessage = ref<string>();

const allBooks = ref<KoboBook[]>([]);
const bookBookmarkRefs = ref<Record<string, InstanceType<typeof BookBookmark>>>({});
const bookmarkSearchActive = ref<boolean>(false);
const bookmarkSearch = ref<string>();
const toolbarPinned = useSyncSetting(SettingKey.BookmarksToolbarPinned);

const { bookSortingPriority, bookSorting, bookmarkSorting, sortedBooks, keepSortingOnce } = useBookSorting({
  allBooks,
});
const {
  bookCollectionIdFilter,
  highlightColorFilter,
  books: filteredBooks,
  activeBookCollection,
} = useBookFilter({ books: sortedBooks });
const { showBookSearchModal, onBookModalSelect, onBookModalAlterSelect } = useBookSearchModal({
  gotoBook,
  expandBook,
});
const { books: booksToShow, expandedBookId, onExpandedBookUpdated } = useExpandedBook({ books: filteredBooks });
const { archiveBook, cancelArchiveBook, archiveBookmark, cancelArchiveBookmark } = useBookBookmarkArchive({
  reloadBooks,
});
const { updateBookById, toggleBookStar, updateBookCoverImage } = useUpdateBook({ allBooks, keepSortingOnce });
const { openShareBooksWithDropboxDialog } = useShareBookDialog();
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
  archiveSelected,
  deleteSelected,
} = useMultiBookActions({ allBooks: booksToShow, reloadBooks });
const { handleCreateCollection, handleEditCollection, addSelectionToCollection, removeSelectionFromCollection } =
  useManageBookCollection({ allBooks, selectedBookIds, bookCollectionIdFilter });
const {
  exportingBookIds,
  bookExportTasksToShow,
  exportSelectedToNotion,
  exportBookmarkToText,
  exportBookmarkToMarkdown,
  exportBookmarkToNotion,
  cancelTask,
  discardAllTasks,
} = useBookmarkExport({ selectedBooks, updateBookById });
useBookBookmarkArchive({ reloadBooks });

onMounted(async () => {
  allBooks.value = [];
  bookmarkShare.value = undefined;
  pageResultMessage.value = undefined;

  loadingBooks.value = true;
  await loadBooks();
  loadingBooks.value = false;
  await fetchMissingBookCoverImageUrl();
});

watchEffect(() => (bookmarkSearchActive.value ? (selectedBooks.value = []) : undefined));
watchEffect(() => (selectedBooks.value.length ? (bookmarkSearchActive.value = false) : undefined));

watchEffect(() => {
  let message: string | undefined;
  if (allBooks.value.length && !booksToShow.value.length) {
    if (highlightColorFilter.value.length) {
      message = t('page.bookmarks.no_matching_bookmarks');
    } else if (bookCollectionIdFilter.value) {
      message = t('page.bookmarks.no_books_in_selected_book_collection');
    } else {
      message = t('page.bookmarks.no_matching_bookmarks');
    }
  } else {
    message = undefined;
  }
  pageResultMessage.value = message;
});
watch(
  () => showBookSearchModal.value,
  (show) => (bookmarkSearchActive.value = bookmarkSearchActive.value && !show),
);
watch(
  () => bookmarkSearchActive.value,
  (active) => (showBookSearchModal.value = showBookSearchModal.value && !active),
);

async function loadBooks(): Promise<void> {
  const shareId = route.params.shareId as string;
  if (shareId) {
    loadingBar.start();
    await loadBooksFromShareId(shareId);
    loadingBar.finish();
  } else {
    allBooks.value = await getBooksFromDb();
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

async function fetchMissingBookCoverImageUrl(): Promise<void> {
  if (!allBooks.value?.length) {
    return;
  }
  const pendingBooks = allBooks.value.filter((book) => isNil(book.coverImageUrl));
  await Promise.all(
    pendingBooks.map(async (book) => {
      const imageUrl = await findCoverImageForBook(book);
      if (imageUrl) {
        updateBookById(book.id, (b) => ({ ...b, coverImageUrl: imageUrl }));
      }
      return Promise.resolve();
    }),
  );
}

function setBookBookmarkRef(nodeRef: Element | ComponentPublicInstance | null): void {
  const bookBookmarkInstance = nodeRef as ComponentInstance<typeof BookBookmark> | undefined;
  if (bookBookmarkInstance) {
    bookBookmarkRefs.value[bookBookmarkInstance?.book.id] = bookBookmarkInstance;
  }
}

function gotoBook(bookId: string): void {
  const virtualList = virtualListRef.value;
  if (!virtualList) {
    return;
  }
  const bookIndex = booksToShow.value.findIndex((book) => book.id === bookId);
  const action = (): void => (virtualList as { scrollTo: (index: number) => void }).scrollTo(bookIndex);
  if (expandedBookId.value === bookId) {
    action();
  } else {
    expandedBookId.value = undefined;
    nextTick(action);
  }
}

function gotoBookmark(book: KoboBook, bookmark: KoboBookmark): void {
  if (expandedBookId.value !== book.id) {
    expandedBookId.value = book.id;
    nextTick(() => {
      bookBookmarkRefs.value[book.id]?.scrollToBookmark(bookmark, { block: 'center' });
    });
  } else {
    bookBookmarkRefs.value[book.id]?.scrollToBookmark(bookmark, { behavior: 'smooth', block: 'center' });
  }
}

function expandBook(bookId: string): void {
  expandedBookId.value = bookId;
  gotoBook(bookId);
}

async function reloadBooks(): Promise<void> {
  allBooks.value = await getBooksFromDb();
}

async function updateBookmark(book: KoboBook, bookmarkId: string, bookmarkPatch: Partial<KoboBookmark>): Promise<void> {
  const targetBookmarkIndex = book.bookmarks.findIndex((b) => b.id === bookmarkId);
  if (targetBookmarkIndex === -1) {
    return;
  }
  const bookmarks = [...book.bookmarks];
  const bookmarkToUpdate = deepToRaw(bookmarks[targetBookmarkIndex]);
  bookmarks[targetBookmarkIndex] = updateBookmarkByPatch(bookmarkToUpdate, bookmarkPatch);
  const updatedBook: KoboBook = { ...book, bookmarks };

  const targetBookIndex = allBooks.value.findIndex((b) => b.id === book.id);
  if (targetBookIndex !== -1) {
    const updatedAllBooks = [...allBooks.value];
    updatedAllBooks[targetBookIndex] = updatedBook;
    allBooks.value = updatedAllBooks;
  }
  await putBooksToDb([deepToRaw(updatedBook)]);
  allBooks.value = await getBooksFromDb();
}
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
