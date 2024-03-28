<template>
  <div class="page-content bookmark-page">
    <div v-if="booksToShow.length" class="bookmark-page-tools">
      <BookSortingSelect v-model:bookSorting="bookSorting" v-model:bookmarkSorting="bookmarkSorting" />
    </div>

    <div v-if="booksToShow.length" class="books-container">
      <BookBookmark
        v-for="book in booksToShow"
        :key="book.id"
        ref="bookBookmarkRefs"
        :book="book"
        :default-expanded="booksToShow?.length === 1"
        :exportNotionLoading="exportingBookIds.includes(book.id)"
        @onTextExportClick="exportBookmarkToText"
        @onMarkdownExportClick="exportBookmarkToMarkdown"
        @onNotionExportClick="exportBookmarkToNotion"
        @onBookDelete="deleteBookConfirm"
        @onBookmarkDelete="deleteBookmark"
      />
    </div>

    <div v-if="!loadBooks && !booksToShow.length" class="empty-bookmarks-message-container">
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
import { onMounted, ref, computed, h } from 'vue';

import { useMessage, useNotification, useDialog } from 'naive-ui';
import { isNil } from 'ramda';
import { useI18n } from 'vue-i18n';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { SettingKey } from '@/enum/setting-key';
import { BookExportTask, BookExportState } from '@/interface/book-export-task';
import BookBookmark from '@/module/bookmarks/component/BookBookmark/BookBookmark.vue';
import BookExportProgressModal from '@/module/bookmarks/component/BookExportProgressModal/BookExportProgressModal.vue';
import BookSortingSelect from '@/module/bookmarks/component/BookSortingSelect/BookSortingSelect.vue';
import DeleteBookDialogContent from '@/module/bookmarks/component/DeleteBookDialogContent/DeleteBookDialogContent.vue';
import { findCoverImageForBook } from '@/services/bookmark/book-cover.service';
import { getAllBooksFromDb, putBooksToDb, deleteBooksInDb } from '@/services/bookmark/bookmark-manage.service';
import { sortKoboBooks, sortKoboBookmarks } from '@/services/bookmark/kobo-book-sort.service';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { handleNotionApiError } from '@/services/notion/notion-api-error-handing.service';
import { exportBookBookmarks } from '@/services/notion/notion-export.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { textToFileDownload } from '@/util/browser-utils';
import { deepToRaw } from '@/util/vue-utils';

const { t } = useI18n<[I18NMessageSchema]>();

const message = useMessage();
const notification = useNotification();
const dialog = useDialog();

const loadBooks = ref<boolean>(false);
const allBooks = ref<KoboBook[]>();
const bookSorting = useSyncSetting(SettingKey.BookSorting, BookSortingKey.LastBookmark);
const bookmarkSorting = useSyncSetting(SettingKey.BookmarkSorting, BookmarkSortingKey.LastUpdate);
const bookBookmarkRefs = ref<InstanceType<typeof BookBookmark>[]>([]);
const pendingExportRequest = ref<Promise<void>>();
const bookExportTasks = ref<BookExportTask[]>([]);

const bookExportTasksToShow = computed(() => bookExportTasks.value.toReversed().filter((task) => task.hidden !== true));
const exportingBookIds = computed(() => {
  return bookExportTasks.value
    .filter((task) => task.state === BookExportState.Pending || task.state === BookExportState.Running)
    .map((task) => task.book.id);
});

onMounted(async () => {
  loadBooks.value = true;
  allBooks.value = await getAllBooksFromDb();
  loadBooks.value = false;
  await fetchMissingBookCoverImageUrl();
});

const booksToShow = computed(() => {
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
  const content = bookmarkToText(book);
  textToFileDownload(content, `${book.info.title}.txt`, 'text/plain');
}

function exportBookmarkToMarkdown(book: KoboBook): void {
  const content = bookmarkToMarkdown(book);
  textToFileDownload(content, `${book.info.title}.md`, 'text/markdown');
}

async function exportBookmarkToNotion(book: KoboBook): Promise<void> {
  if (!isNotionIntegrationReady()) {
    message.error(t('page.bookmarks.connect_to_notion_notice'));
    return;
  }
  const task: BookExportTask = { id: Date.now(), book, state: BookExportState.Pending };
  bookExportTasks.value.push(task);

  if (pendingExportRequest.value) {
    return;
  }
  pendingExportRequest.value = tryExportBookmark(book, task);
  await pendingExportRequest.value;
  pendingExportRequest.value = undefined;
}

function isNotionIntegrationReady(): boolean {
  return !!getSettingFromStorage(SettingKey.NotionAuth)?.access_token;
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

function deleteBookConfirm(book: KoboBook): void {
  dialog.warning({
    title: t('common.delete'),
    content: () => h(DeleteBookDialogContent, { book }),
    negativeText: t('common.cancel'),
    positiveText: t('common.yes'),
    onPositiveClick: () => deleteBook(book),
  });
}

async function deleteBook(book: KoboBook): Promise<void> {
  await deleteBooksInDb([book.id]);
  allBooks.value = await getAllBooksFromDb();
}

async function deleteBookmark(book: KoboBook, bookmark: KoboBookmark): Promise<void> {
  const updatedBook: KoboBook = { ...book, bookmarks: book.bookmarks.filter((bm) => bm.id !== bookmark.id) };
  await putBooksToDb([deepToRaw(updatedBook)]);
  allBooks.value = await getAllBooksFromDb();
}
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
