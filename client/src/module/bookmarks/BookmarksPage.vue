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
        :selectedBooks="selectedBooks"
        @textExportClick="exportSelectedAsText"
        @markdownExportClick="exportSelectedAsMarkdown"
        @notionExportClick="exportSelectedToNotion"
        @exportBookFileClick="exportSelectedAsFile"
        @archiveClick="archiveSelected"
        @deleteClick="deleteSelected"
        @shareClick="openShareBooksWithDropboxDialog(selectedBooks)"
      />
      <div
        v-if="!showMultiSelectToolbar"
        class="bookmark-list-actions"
        :class="{ 'bookmark-list-actions-expanded': bookmarkSearchActive }"
      >
        <BookmarkSearch v-model:show="bookmarkSearchActive" :books="booksToShow" @selected="gotoBookmark" />
        <ToolbarPinToggle v-if="!bookmarkSearchActive" v-model:pin="toolbarPinned" />
        <BookmarkFilterDropdown
          v-if="!bookmarkSearchActive"
          v-model:colors="highlightColorFilter"
          :disabled="!allBooks.length"
        />
        <BookmarkSortingDropdown
          v-if="!bookmarkSearchActive"
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

    <div v-if="allBooks.length" class="books-container">
      <BookBookmark
        v-for="book in booksToShow"
        :key="book.id"
        ref="bookBookmarkRefs"
        :book="book"
        :default-expanded="booksToShow?.length === 1"
        :selected="selectedBookIds.includes(book.id)"
        :readonly="!!bookmarkShare"
        :exportNotionLoading="exportingBookIds.includes(book.id)"
        @update:selected="(v) => onBookSelectChanges(book, v)"
        @textExportClick="exportBookmarkToText"
        @markdownExportClick="exportBookmarkToMarkdown"
        @notionExportClick="exportBookmarkToNotion"
        @bookCoverImageUpdated="(v) => updateBookCoverImage(book, v)"
        @bookArchiveClick="archiveBook"
        @shareClick="openShareBooksWithDropboxDialog([book])"
        @bookCancelArchive="cancelArchiveBook"
        @bookmarkColorChanged="updateBookmarkColor"
        @createBookmarkCardClick="openBookmarkCardDialog"
        @bookmarkArchiveClick="archiveBookmark"
        @bookmarkCancelArchiveClick="cancelArchiveBookmark"
      />
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
        @taskClick="gotoBook"
        @cancelTask="cancelTask"
        @discardAllTasks="discardAllTasks"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watchEffect } from 'vue';

import * as E from 'fp-ts/Either';
import { useNotification, NCheckbox, useLoadingBar } from 'naive-ui';
import { isNil } from 'ramda';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import PageResult from '@/component/PageResult/PageResult.vue';
import { useCheckNotionToken } from '@/composition/use-check-notion-token';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookmarkShare } from '@/dto/bookmark-share';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { CheckboxState } from '@/enum/checkbox-state';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import { BookExportTask, BookExportState } from '@/interface/book-export-task';
import { useBookmarkCardDialog } from '@/module/bookmark-card-dialog/composition/use-bookmark-card-dialog';
import BookBookmark from '@/module/bookmarks/component/BookBookmark/BookBookmark.vue';
import BookExportProgressModal from '@/module/bookmarks/component/BookExportProgressModal/BookExportProgressModal.vue';
import BookmarkFilterDropdown from '@/module/bookmarks/component/BookmarkFilterDropdown/BookmarkFilterDropdown.vue';
import BookmarkSearch from '@/module/bookmarks/component/BookmarkSearch/BookmarkSearch.vue';
import BookmarkShareView from '@/module/bookmarks/component/BookmarkShareView/BookmarkShareView.vue';
import BookmarkSortingDropdown from '@/module/bookmarks/component/BookmarkSortingDropdown/BookmarkSortingDropdown.vue';
import MultiBookActionBar from '@/module/bookmarks/component/MultiBookActionBar/MultiBookActionBar.vue';
import ToolbarPinToggle from '@/module/bookmarks/component/ToolbarPinToggle/ToolbarPinToggle.vue';
import { useBookBookmarkArchive } from '@/module/bookmarks/composition/use-book-bookmark-archive';
import { useMultiBookActions } from '@/module/bookmarks/composition/use-multi-book-actions';
import { useShareBookDialog } from '@/module/bookmarks/composition/use-share-book-dialog';
import { findCoverImageForBook } from '@/services/bookmark/book-cover.service';
import { getBooksFromDb, putBooksToDb } from '@/services/bookmark/bookmark-manage.service';
import { sortKoboBooks, sortKoboBookmarks } from '@/services/bookmark/kobo-book-sort.service';
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

const bookmarkShare = ref<BookmarkShare>();
const loadingBooks = ref<boolean>(false);
const pageResultMessage = ref<string>();

const allBooks = ref<KoboBook[]>([]);
const bookSorting = useSyncSetting(SettingKey.BookSorting, BookSortingKey.LastBookmark);
const bookmarkSorting = useSyncSetting(SettingKey.BookmarkSorting, BookmarkSortingKey.Position);
const bookBookmarkRefs = ref<InstanceType<typeof BookBookmark>[]>([]);
const bookmarkSearchActive = ref<boolean>(false);
const toolbarPinned = useSyncSetting(SettingKey.BookmarksToolbarPinned);
const highlightColorFilter = ref<HighlightColor[]>([]);
const pendingExportRequest = ref<Promise<void>>();
const bookExportTasks = ref<BookExportTask[]>([]);
const lastTaskId = ref<number>(0);

const sortedBooks = computed(() => {
  if (!allBooks.value) {
    return [];
  }
  let books = sortKoboBooks(allBooks.value, bookSorting.value ? [bookSorting.value] : []);
  books = books.map((book) => {
    return {
      ...book,
      bookmarks: bookmarkProcess(book),
    };
  });
  return books;
});

const { archiveBook, cancelArchiveBook, archiveBookmark, cancelArchiveBookmark } = useBookBookmarkArchive({
  reloadBooks,
});
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
} = useMultiBookActions({ allBooks: sortedBooks, reloadBooks });
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

const booksToShow = computed(() => {
  const colors = highlightColorFilter.value;
  if (!colors.length) {
    return sortedBooks.value;
  }
  return sortedBooks.value.flatMap((book) => {
    const bookmarks = book.bookmarks.filter((bookmark) => bookmark.color && colors.includes(bookmark.color));
    return bookmarks.length ? [{ ...book, bookmarks }] : [];
  });
});
watchEffect(() => {
  pageResultMessage.value =
    allBooks.value.length && !booksToShow.value.length ? t('page.bookmarks.no_matching_bookmarks') : undefined;
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

function bookmarkProcess(book: KoboBook): KoboBookmark[] {
  return sortKoboBookmarks(book.bookmarks, bookmarkSorting.value ? [bookmarkSorting.value] : []);
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

function updateBookById(bookId: string, updater: (book: KoboBook) => KoboBook): void {
  const currentBooks = allBooks.value || [];
  const indexOfBookToUpdate = currentBooks.findIndex((b) => b.id === bookId);
  if (indexOfBookToUpdate === -1) {
    return;
  }
  let targetBook = currentBooks[indexOfBookToUpdate];
  targetBook = updater(targetBook);
  currentBooks[indexOfBookToUpdate] = targetBook;
  allBooks.value = currentBooks;
  putBooksToDb([deepToRaw(targetBook)]);
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

function gotoBook(task: BookExportTask): void {
  const bookIndex = booksToShow.value.findIndex((book) => book.id === task.book.id);
  const bookComponent = bookBookmarkRefs.value[bookIndex];
  bookComponent?.elementRef?.scrollIntoView({ behavior: 'smooth' });
}

function gotoBookmark(book: KoboBook, bookmark: KoboBookmark): void {
  const bookIndex = booksToShow.value.findIndex((b) => b.id === book.id);
  const bookComponent = bookBookmarkRefs.value[bookIndex];
  bookComponent?.scrollToBookmark(bookmark);
}

async function updateBookCoverImage(book: KoboBook, coverImageUrl: string): Promise<void> {
  updateBookById(book.id, (b) => ({ ...b, coverImageUrl }));
  allBooks.value = await getBooksFromDb();
}

async function reloadBooks(): Promise<void> {
  allBooks.value = await getBooksFromDb();
}

async function updateBookmarkColor(book: KoboBook, bookmark: KoboBookmark, color: HighlightColor): Promise<void> {
  const targetBookmarkIndex = book.bookmarks.indexOf(bookmark);
  if (targetBookmarkIndex === -1) {
    return;
  }
  const bookmarks = [...book.bookmarks];
  bookmarks[targetBookmarkIndex] = { ...bookmarks[targetBookmarkIndex], color };
  const updatedBook: KoboBook = { ...book, bookmarks };
  await putBooksToDb([deepToRaw(updatedBook)]);
  allBooks.value = await getBooksFromDb();
}
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
