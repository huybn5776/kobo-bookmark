<template>
  <div class="demo-book-view">
    <template v-for="book in allBooks" :key="book.id">
      <BookItem
        v-model:expanded="expanded"
        :book="book"
        :enabledActions="enabledBookActions"
        @textExportClick="exportBookmarkToText"
        @markdownExportClick="exportBookmarkToMarkdown"
        @bookCoverImageUpdated="updateBookCoverImage(book, $event)"
      />
      <BookmarkList
        v-if="expanded"
        showAllBookmarks
        :book="book"
        @bookmarkColorChanged="(bookmark, color) => updateBookmarkColor(book, bookmark, color)"
        @bookmarkArchive="archiveBookmark(book, $event)"
        @bookmarkCancelArchive="cancelArchiveBookmark(book, $event)"
        @createBookmarkCardClick="openBookmarkCardDialog(book, $event)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookAction } from '@/enum/book-action';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import { useBookmarkCardDialog } from '@/module/bookmark-card-dialog/composition/use-bookmark-card-dialog';
import BookItem from '@/module/bookmarks/component/BookItem/BookItem.vue';
import BookmarkList from '@/module/bookmarks/component/BookmarkList/BookmarkList.vue';
import { koboBookSchema } from '@/schema/kobo-book-schema';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { textToFileDownload } from '@/util/browser-utils';

const enabledBookActions: BookAction[] = [BookAction.ExportText, BookAction.ExportMarkdown];

const allBooks = ref<KoboBook[]>([]);
const expanded = ref<boolean>(true);
const { openBookmarkCardDialog } = useBookmarkCardDialog();

onMounted(async () => {
  const language = getSettingFromStorage(SettingKey.Language) || navigator.language;
  const data = language.startsWith('zh')
    ? await import('@/assets/intro/zh-tw/demo-book.json')
    : await import('@/assets/intro/en/demo-book.json');
  allBooks.value = [koboBookSchema.parse(data) as KoboBook];
});

function exportBookmarkToText(book: KoboBook): void {
  const content = bookmarkToText([book]);
  textToFileDownload(content, `${book.info.title}.txt`, 'text/plain');
}

function exportBookmarkToMarkdown(book: KoboBook): void {
  const content = bookmarkToMarkdown([book]);
  textToFileDownload(content, `${book.info.title}.md`, 'text/markdown');
}

async function updateBookCoverImage(book: KoboBook, coverImageUrl: string): Promise<void> {
  const indexToUpdate = allBooks.value.findIndex((b) => b.id === book.id);
  if (indexToUpdate === -1) {
    return;
  }
  allBooks.value[indexToUpdate] = { ...allBooks.value[indexToUpdate], coverImageUrl };
}

async function updateBookmarkColor(book: KoboBook, bookmark: KoboBookmark, color: HighlightColor): Promise<void> {
  updateBookmark(book.id, bookmark.id, (b) => ({ ...b, color }));
}

function archiveBookmark(book: KoboBook, bookmark: KoboBookmark): void {
  updateBookmark(book.id, bookmark.id, (b) => ({ ...b, isArchived: true }));
}

function cancelArchiveBookmark(book: KoboBook, bookmark: KoboBookmark): void {
  updateBookmark(book.id, bookmark.id, (b) => ({ ...b, isArchived: false }));
}

function updateBookmark(bookId: string, bookmarkId: string, updater: (bookmark: KoboBookmark) => KoboBookmark): void {
  const book = allBooks.value.find((b) => b.id === bookId);
  if (!book) {
    return;
  }
  const targetBookmarkIndex = book?.bookmarks.findIndex((bookmark) => bookmark.id === bookmarkId);
  if (targetBookmarkIndex === -1) {
    return;
  }
  const bookmarks = [...book.bookmarks];
  bookmarks[targetBookmarkIndex] = updater(bookmarks[targetBookmarkIndex]);
  const updatedBook: KoboBook = { ...book, bookmarks };
  allBooks.value = [updatedBook];
}
</script>

<style lang="scss" scoped>
@import './DemoBookView';
</style>
