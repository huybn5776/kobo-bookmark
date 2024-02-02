<template>
  <div class="page-content bookmark-page">
    <div class="books-container">
      <BookBookmark v-for="book in books" :key="book.id" :book="book" :default-expanded="books?.length === 1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { sortWith, ascend, descend, isNil } from 'ramda';

import { KoboBook } from '@/dto/kobo-book';
import BookBookmark from '@/module/bookmarks/components/BookBookmark/BookBookmark.vue';
import { findCoverImageForBook } from '@/services/book-cover.service';
import { getFromStorage, saveToStorage } from '@/util/storage-utils';

const books = ref<KoboBook[]>();
onMounted(() => {
  let allBooks = getFromStorage<KoboBook[]>('books');
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
      saveToStorage('books', books.value);
      return Promise.resolve();
    }),
  );
}
</script>

<style lang="scss" scoped>
@import './BookmarksPage';
</style>
