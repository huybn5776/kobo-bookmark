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
        :exportLoading="exportingBookIds.includes(book.id)"
        @onExportClick="exportBookmark"
      />
    </div>

    <div v-if="!loadBooks && !booksToShow.length" class="empty-bookmarks-message-container">
      <span class="empty-bookmarks-emoji">¯\_(ツ)_/¯</span>
      <span class="empty-bookmarks-message">You didn't have any bookmark here yet,</span>
      <span class="empty-bookmarks-message">
        try to <router-link :to="{ name: 'import' }">Import</router-link> some?
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
import { onMounted, ref, computed } from 'vue';

import { useMessage, useNotification } from 'naive-ui';
import { isNil } from 'ramda';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { SettingKey } from '@/enum/setting-key';
import { BookExportTask, BookExportState } from '@/interface/book-export-task';
import BookBookmark from '@/module/bookmarks/components/BookBookmark/BookBookmark.vue';
import BookExportProgressModal from '@/module/bookmarks/components/BookExportProgressModal/BookExportProgressModal.vue';
import BookSortingSelect from '@/module/bookmarks/components/BookSortingSelect/BookSortingSelect.vue';
import { findCoverImageForBook } from '@/services/book-cover.service';
import { getAllBooksFromDb, putBooksToDb } from '@/services/bookmark-manage.service';
import { sortKoboBooks, sortKoboBookmarks } from '@/services/kobo-book-sort.service';
import { handleNotionApiError } from '@/services/notion-api-error-handing.service';
import { exportBookBookmarks } from '@/services/notion-export.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { deepToRaw } from '@/util/vue-utils';

const message = useMessage();
const notification = useNotification();

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

async function exportBookmark(book: KoboBook): Promise<void> {
  if (!isNotionIntegrationReady()) {
    message.error('Please connect to Notion at Settings page first.');
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
    const pageId = await exportBookBookmarks(book, task, (updatedTask) => {
      const currentTask = getTaskById(task);
      if (currentTask?.state === BookExportState.Canceled) {
        throw new Error('Task canceled');
      }
      updateTask(updatedTask);
    });
    updateBookById(book.id, (b) => ({ ...b, lastExportedNotionPageId: pageId }));
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

function updateTask(task: BookExportTask): void {
  const taskIndex = bookExportTasks.value.findIndex((t) => t.id === task.id);
  if (taskIndex === -1) {
    return;
  }
  bookExportTasks.value[taskIndex] = task;
}

function getTaskById(task: BookExportTask): BookExportTask | undefined {
  return bookExportTasks.value.find((t) => t.id === task.id);
}

function cancelTask(task: BookExportTask): void {
  const currentTask = bookExportTasks.value.find((t) => t.id === task.id);
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
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
