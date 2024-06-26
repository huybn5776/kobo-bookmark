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
        />
      </div>
      <NCheckbox
        size="large"
        :checked="selectedBooksCheckState === CheckboxState.Checked"
        :indeterminate="selectedBooksCheckState === CheckboxState.Indeterminate"
        @click="handleMasterCheckboxClick"
      />
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

    <div v-if="!loadingBooks && !pageResultMessage && !allBooks.length" class="empty-bookmarks-message-container">
      <span class="empty-bookmarks-emoji">¯\_(ツ)_/¯</span>
      <span class="empty-bookmarks-message">
        <i18n-t keypath="page.bookmarks.empty_bookmarks1" />
      </span>
      <span class="empty-bookmarks-message">
        <i18n-t keypath="page.bookmarks.empty_bookmarks2">
          <router-link :to="{ name: 'import' }">
            <i18n-t keypath="page_name.import" />
          </router-link>
        </i18n-t>
      </span>
    </div>

    <Teleport v-if="!!bookExportTasksToShow.length" to="#app">
      <BookExportProgressModal
        :tasks="bookExportTasksToShow"
        @taskClick="gotoBook($event.book.id)"
        @cancelTask="cancelTask"
        @discardAllTasks="discardAllTasks"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect, ComponentInstance, ComponentPublicInstance } from 'vue';

import * as E from 'fp-ts/Either';
import { useNotification, NCheckbox, useLoadingBar } from 'naive-ui';
import { isNil } from 'ramda';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import PageResult from '@/component/PageResult/PageResult.vue';
import VirtualList from '@/component/VirtualList/VirtualList.vue';
import { useCheckNotionToken } from '@/composition/use-check-notion-token';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookmarkShare } from '@/dto/bookmark-share';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { CheckboxState } from '@/enum/checkbox-state';
import { SettingKey } from '@/enum/setting-key';
import { BookExportTask, BookExportState } from '@/interface/book-export-task';
import { useBookmarkCardDialog } from '@/module/bookmark-card-dialog/composition/use-bookmark-card-dialog';
import ActiveBookCollectionView from '@/module/bookmarks/component/ActiveBookCollectionView/ActiveBookCollectionView.vue';
import BookBookmark from '@/module/bookmarks/component/BookBookmark/BookBookmark.vue';
import BookExportProgressModal from '@/module/bookmarks/component/BookExportProgressModal/BookExportProgressModal.vue';
import BookmarkFilterDropdown from '@/module/bookmarks/component/BookmarkFilterDropdown/BookmarkFilterDropdown.vue';
import BookmarkSearch from '@/module/bookmarks/component/BookmarkSearch/BookmarkSearch.vue';
import BookmarkShareView from '@/module/bookmarks/component/BookmarkShareView/BookmarkShareView.vue';
import BookmarkSortingDropdown from '@/module/bookmarks/component/BookmarkSortingDropdown/BookmarkSortingDropdown.vue';
import MultiBookActionBar from '@/module/bookmarks/component/MultiBookActionBar/MultiBookActionBar.vue';
import ToolbarPinToggle from '@/module/bookmarks/component/ToolbarPinToggle/ToolbarPinToggle.vue';
import { useBookBookmarkArchive } from '@/module/bookmarks/composition/use-book-bookmark-archive';
import { useBookFilter } from '@/module/bookmarks/composition/use-book-filter';
import { useBookSorting } from '@/module/bookmarks/composition/use-book-sorting';
import { useExpandedBook } from '@/module/bookmarks/composition/use-expanded-book';
import { useManageBookCollection } from '@/module/bookmarks/composition/use-manage-book-collection';
import { useMultiBookActions } from '@/module/bookmarks/composition/use-multi-book-actions';
import { useShareBookDialog } from '@/module/bookmarks/composition/use-share-book-dialog';
import { useUpdateBook } from '@/module/bookmarks/composition/use-update-book';
import { findCoverImageForBook } from '@/services/bookmark/book-cover.service';
import { getBooksFromDb, putBooksToDb, updateBookmarkByPatch } from '@/services/bookmark/bookmark-manage.service';
import { getBookmarksShareFromDropboxShareId } from '@/services/dropbox/dropbox.service';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { handleNotionApiError } from '@/services/notion/notion-api-error-handing.service';
import { exportBookBookmarks } from '@/services/notion/notion-export.service';
import { textToFileDownload } from '@/util/browser-utils';
import { deepToRaw } from '@/util/vue-utils';

const { t } = useI18n<[I18NMessageSchema]>();

const route = useRoute();
const notification = useNotification();
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
const pendingExportRequest = ref<Promise<void>>();
const bookExportTasks = ref<BookExportTask[]>([]);
const lastTaskId = ref<number>(0);

const { bookSortingPriority, bookSorting, bookmarkSorting, sortedBooks, keepSortingOnce } = useBookSorting({
  allBooks,
});
const {
  bookCollectionIdFilter,
  highlightColorFilter,
  books: filteredBooks,
  activeBookCollection,
} = useBookFilter({ books: sortedBooks });
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
useBookBookmarkArchive({ reloadBooks });
const { checkIsNotionReady } = useCheckNotionToken();

const bookExportTasksToShow = computed(() => bookExportTasks.value.toReversed().filter((task) => task.hidden !== true));
const exportingBookIds = computed(() => {
  return bookExportTasks.value
    .filter((task) => task.state === BookExportState.Pending || task.state === BookExportState.Running)
    .map((task) => task.book.id);
});

watchEffect(async () => {
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

function exportBookmarkToText(book: KoboBook): void {
  const content = bookmarkToText([book]);
  textToFileDownload(content, `${book.info.title}.txt`, 'text/plain');
}

function exportBookmarkToMarkdown(book: KoboBook): void {
  const content = bookmarkToMarkdown([book]);
  textToFileDownload(content, `${book.info.title}.md`, 'text/markdown');
}

async function exportBookmarkToNotion(book: KoboBook): Promise<void> {
  if (!checkIsNotionReady()) {
    return;
  }
  const task: BookExportTask = { id: (lastTaskId.value += 1), book, state: BookExportState.Pending };
  bookExportTasks.value.push(task);

  if (pendingExportRequest.value) {
    return;
  }
  pendingExportRequest.value = tryExportBookmark(book, task);
  await pendingExportRequest.value;
  pendingExportRequest.value = undefined;
}

function exportSelectedToNotion(): void {
  if (!checkIsNotionReady()) {
    return;
  }
  selectedBooks.value.forEach((book) => exportBookmarkToNotion(book));
}

async function tryExportBookmark(book: KoboBook, task: BookExportTask): Promise<void> {
  try {
    const notionExportState = await exportBookBookmarks(book, task, (updatedTask) => {
      const currentTask = getTaskById(task);
      if (currentTask?.state === BookExportState.Canceled) {
        throw new Error('Task canceled');
      }
      updateTask(updatedTask);
    });
    updateBookById(book.id, (b) => ({ ...b, notion: notionExportState }));
  } catch (e) {
    const currentTask = getTaskById(task);
    if (currentTask?.state !== BookExportState.Canceled) {
      console.error(e);
      const errorMessage = handleNotionApiError(e as Error);
      notification.destroyAll();
      notification.error({ title: `Fail to export book to Notion: '${book.info.title}'`, content: errorMessage });
    }
  }
  await runNextTask();
}

async function runNextTask(): Promise<void> {
  const firstPendingTask = bookExportTasks.value.find((task) => task.state === BookExportState.Pending);
  if (!firstPendingTask) {
    return;
  }
  await tryExportBookmark(firstPendingTask.book, firstPendingTask);
}

function updateTask(exportTask: BookExportTask): void {
  const taskIndex = bookExportTasks.value.findIndex((task) => task.id === exportTask.id);
  if (taskIndex === -1) {
    return;
  }
  bookExportTasks.value[taskIndex] = exportTask;
}

function getTaskById(exportTask: BookExportTask): BookExportTask | undefined {
  return bookExportTasks.value.find((task) => task.id === exportTask.id);
}

function cancelTask(exportTask: BookExportTask): void {
  const currentTask = bookExportTasks.value.find((task) => task.id === exportTask.id);
  if (!currentTask) {
    return;
  }
  updateTask({ ...currentTask, state: BookExportState.Canceled });
}

function discardAllTasks(): void {
  for (let i = 0; i < bookExportTasks.value.length; i += 1) {
    const task = bookExportTasks.value[i];
    const updatedTask = { ...task };
    if (task.state === BookExportState.Pending || task.state === BookExportState.Running) {
      updatedTask.state = BookExportState.Canceled;
    }
    updatedTask.hidden = true;
    bookExportTasks.value[i] = updatedTask;
  }
}

function setBookBookmarkRef(nodeRef: Element | ComponentPublicInstance | null): void {
  const bookBookmarkInstance = nodeRef as ComponentInstance<typeof BookBookmark> | undefined;
  if (bookBookmarkInstance) {
    bookBookmarkRefs.value[bookBookmarkInstance?.book.id] = bookBookmarkInstance;
  }
}

function gotoBook(bookId: string): void {
  if (virtualListRef.value) {
    const bookIndex = booksToShow.value.findIndex((book) => book.id === bookId);
    (virtualListRef.value as { scrollTo: (index: number) => void }).scrollTo(bookIndex);
  }
}

function gotoBookmark(book: KoboBook, bookmark: KoboBookmark): void {
  if (expandedBookId.value !== book.id) {
    expandedBookId.value = book.id;
    setTimeout(() => {
      bookBookmarkRefs.value[book.id]?.scrollToBookmark(bookmark, { block: 'center' });
    });
  } else {
    bookBookmarkRefs.value[book.id]?.scrollToBookmark(bookmark, { behavior: 'smooth', block: 'center' });
  }
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
