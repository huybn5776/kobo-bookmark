import { ref, Ref, watch } from 'vue';

import { indexBy, prop } from 'ramda';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookSortingPriorityKey } from '@/enum/book-sorting-priority-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';
import { SettingKey } from '@/enum/setting-key';
import { sortKoboBooks, sortKoboBooksByTag, sortKoboBookmarks } from '@/services/bookmark/kobo-book-sort.service';

export function useBookSorting({ allBooks }: { allBooks: Ref<KoboBook[]> }): {
  bookSortingPriority: Ref<BookSortingPriorityKey | undefined>;
  bookSorting: Ref<BookSortingKey | undefined>;
  bookmarkSorting: Ref<BookmarkSortingKey | undefined>;
  sortedBooks: Ref<KoboBook[]>;
  keepSortingOnce: () => void;
} {
  const bookSortingPriority = useSyncSetting(SettingKey.BookSortingPriority, BookSortingPriorityKey.Stared);
  const bookSorting = useSyncSetting(SettingKey.BookSorting, BookSortingKey.LastBookmark);
  const bookmarkSorting = useSyncSetting(SettingKey.BookmarkSorting, BookmarkSortingKey.Position);
  const sortedBooks = ref<KoboBook[]>([]);
  const keepSortingOnceMark = ref<boolean>(false);

  watch(() => [allBooks.value, bookSortingPriority.value, bookSorting.value, bookmarkSorting.value], sortBooks);

  function sortBooks(): void {
    if (!allBooks.value) {
      sortedBooks.value = [];
      return;
    }
    if (keepSortingOnceMark.value) {
      keepSortingOnceMark.value = false;
      const allBooksMap = indexBy(prop('id'), allBooks.value);
      sortedBooks.value = sortedBooks.value.map((book) => allBooksMap[book.id]);
      return;
    }
    let books = sortKoboBooks(allBooks.value, bookSorting.value ? [bookSorting.value] : []);
    books = sortKoboBooksByTag(books, bookSortingPriority.value);
    books = books.map((book) => ({ ...book, bookmarks: bookmarkProcess(book) }));
    sortedBooks.value = books;
  }

  function bookmarkProcess(book: KoboBook): KoboBookmark[] {
    return sortKoboBookmarks(book.bookmarks, bookmarkSorting.value ? [bookmarkSorting.value] : []);
  }

  function keepSortingOnce(): void {
    keepSortingOnceMark.value = true;
  }

  return { bookSortingPriority, bookSorting, bookmarkSorting, sortedBooks, keepSortingOnce };
}
