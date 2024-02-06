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

import { isNil } from 'ramda';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { SettingKey } from '@/enum/setting-key';
import BookBookmark from '@/module/bookmarks/components/BookBookmark/BookBookmark.vue';
import BookSortingSelect from '@/module/bookmarks/components/BookSortingSelect/BookSortingSelect.vue';
import { findCoverImageForBook } from '@/services/book-cover.service';
import { sortKoboBooks, sortKoboBookmarks } from '@/services/kobo-book-sort.service';
import { exportBookBookmarks } from '@/services/notion-export.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

const allBooks = ref<KoboBook[]>();
const bookSorting = useSyncSetting(SettingKey.BookSorting, BookSortingKey.LastBookmark);
const bookmarkSorting = useSyncSetting(SettingKey.BookmarkSorting, BookmarkSortingKey.LastUpdate);
const pendingExportRequests = ref<Promise<void>[]>([]);
const exportingBooks = ref<KoboBook[]>([]);

onMounted(() => {
  allBooks.value = getSettingFromStorage(SettingKey.Books) || [];
  fetchMissingBookCoverImageUrl();
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
      if (!imageUrl) {
        return Promise.resolve();
      }
      const currentBooks = allBooks.value || [];
      const indexOfBookToUpdate = currentBooks.findIndex((b) => b.id === book.id);
      if (indexOfBookToUpdate !== -1) {
        currentBooks[indexOfBookToUpdate].coverImageUrl = imageUrl;
      }
      allBooks.value = currentBooks;
      saveSettingToStorage(SettingKey.Books, allBooks.value);
      return Promise.resolve();
    }),
  );
}

async function exportBookmark(book: KoboBook): Promise<void> {
  const request = tryExportBookmark(book);
  pendingExportRequests.value = [...pendingExportRequests.value, request];
  exportingBooks.value.push(book);
  await request;
  pendingExportRequests.value = pendingExportRequests.value.filter((r) => r !== request);
  exportingBooks.value = exportingBooks.value.filter((b) => b !== book);
}

async function tryExportBookmark(book: KoboBook): Promise<void> {
  try {
    for (const pendingRequest of pendingExportRequests.value) {
      await pendingRequest;
    }
    await exportBookBookmarks(book);
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
