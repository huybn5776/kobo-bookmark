<template>
  <div class="page-content bookmark-page">
    <div class="books-container">
      <BookBookmark
        v-for="book in books"
        :key="book.id"
        :book="book"
        :default-expanded="books?.length === 1"
        :exportLoading="exportingBooks.includes(book)"
        @onExportClick="exportBookmark"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { sortWith, ascend, descend, isNil } from 'ramda';

import { KoboBook } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import BookBookmark from '@/module/bookmarks/components/BookBookmark/BookBookmark.vue';
import { findCoverImageForBook } from '@/services/book-cover.service';
import { exportBookBookmarks } from '@/services/notion-export.service';
import { getSettingFromStorage, saveSettingToStorage } from '@/services/setting.service';

const books = ref<KoboBook[]>();
const pendingExportRequests = ref<Promise<void>[]>([]);
const exportingBooks = ref<KoboBook[]>([]);

onMounted(() => {
  let allBooks = getSettingFromStorage(SettingKey.Books);
  if (allBooks) {
    for (const book of allBooks) {
      book.info.dateLastRead = book.info.dateLastRead ? new Date(book.info.dateLastRead) : undefined;
    }
    allBooks = sortWith([descend((book) => book.info.dateLastRead?.getTime() ?? Number.MAX_VALUE)], allBooks);
    for (const book of allBooks) {
      book.bookmarks = sortWith(
        [
          ascend((bookmark) => bookmark.chapter.relatedChapters[0].index),
          ascend((bookmark) => bookmark.chapterProgress),
        ],
        book.bookmarks,
      );
    }
    books.value = allBooks;
    fetchMissingBookCoverImageUrl();
  }
});

async function fetchMissingBookCoverImageUrl(): Promise<void> {
  if (!books.value?.length) {
    return;
  }
  const pendingBooks = books.value.filter((book) => isNil(book.coverImageUrl));
  await Promise.all(
    pendingBooks.map(async (book) => {
      const imageUrl = await findCoverImageForBook(book);
      if (!imageUrl) {
        return Promise.resolve();
      }
      const currentBooks = books.value || [];
      const indexOfBookToUpdate = currentBooks.findIndex((b) => b.id === book.id);
      if (indexOfBookToUpdate !== -1) {
        currentBooks[indexOfBookToUpdate].coverImageUrl = imageUrl;
      }
      books.value = currentBooks;
      saveSettingToStorage(SettingKey.Books, books.value);
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
