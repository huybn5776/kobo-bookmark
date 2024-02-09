<template>
  <div class="page-content bookmark-page">
    <div class="bookmark-page-tools">
      <BookSortingSelect v-model:bookSorting="bookSorting" v-model:bookmarkSorting="bookmarkSorting" />
    </div>

    <div class="books-container">
      <BookBookmark
        v-for="book in booksToShow"
        :key="book.id"
        :book="book"
        :default-expanded="booksToShow?.length === 1"
        :exportLoading="exportingBooks.includes(book)"
        @onExportClick="exportBookmark"
      />
    </div>
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
import BookBookmark from '@/module/bookmarks/components/BookBookmark/BookBookmark.vue';
import BookSortingSelect from '@/module/bookmarks/components/BookSortingSelect/BookSortingSelect.vue';
import { findCoverImageForBook } from '@/services/book-cover.service';
import { getAllBooksFromDb, putBooksToDb } from '@/services/bookmark-manage.service';
import { sortKoboBooks, sortKoboBookmarks } from '@/services/kobo-book-sort.service';
import { handleNotionApiError } from '@/services/notion-api-error-handing.service';
import {
  exportBookBookmarks,
  clearPage,
  appendBookmarkToPage,
  updatePagePropertiesByBook,
} from '@/services/notion-export.service';
import { isPageExists } from '@/services/notion-page.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { deepToRaw } from '@/util/vue-utils';

const message = useMessage();
const notification = useNotification();

const allBooks = ref<KoboBook[]>();
const bookSorting = useSyncSetting(SettingKey.BookSorting, BookSortingKey.LastBookmark);
const bookmarkSorting = useSyncSetting(SettingKey.BookmarkSorting, BookmarkSortingKey.LastUpdate);
const pendingExportRequests = ref<Promise<void>[]>([]);
const exportingBooks = ref<KoboBook[]>([]);

onMounted(async () => {
  allBooks.value = await getAllBooksFromDb();
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
  const request = tryExportBookmark(book);
  pendingExportRequests.value = [...pendingExportRequests.value, request];
  exportingBooks.value.push(book);
  await request;
  pendingExportRequests.value = pendingExportRequests.value.filter((r) => r !== request);
  exportingBooks.value = exportingBooks.value.filter((b) => b !== book);
}

function isNotionIntegrationReady(): boolean {
  return !!getSettingFromStorage(SettingKey.NotionAuth)?.access_token;
}

async function tryExportBookmark(book: KoboBook): Promise<void> {
  try {
    for (const pendingRequest of pendingExportRequests.value) {
      await pendingRequest;
    }
    if (book.lastExportedNotionPageId && (await isPageExists(book.lastExportedNotionPageId))) {
      await clearPage(book.lastExportedNotionPageId);
      await updatePagePropertiesByBook(book.lastExportedNotionPageId, book);
      await appendBookmarkToPage(book.lastExportedNotionPageId, book);
    } else {
      const response = await exportBookBookmarks(book);
      updateBookById(book.id, (b) => ({ ...b, lastExportedNotionPageId: response.id }));
    }
  } catch (e) {
    console.error(e);
    const errorMessage = handleNotionApiError(e as Error);
    notification.destroyAll();
    notification.error({ title: `Fail to export book to Notion: '${book.info.title}'`, content: errorMessage });
  }
}
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
