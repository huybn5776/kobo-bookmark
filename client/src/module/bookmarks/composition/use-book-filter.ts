import { ref, Ref, computed, ComputedRef, watch } from 'vue';

import { prop } from 'ramda';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { KoboBook } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import { sortByList } from '@/util/array-urils';

export function useBookFilter({ books: allBooks }: { books: Ref<KoboBook[]> }): {
  booksToShow: ComputedRef<KoboBook[]>;
  bookCollectionIdFilter: Ref<string | undefined>;
  highlightColorFilter: Ref<HighlightColor[]>;
} {
  const bookCollections = useSyncSetting(SettingKey.BookCollection);

  const bookCollectionIdFilter = ref<string>();
  const highlightColorFilter = ref<HighlightColor[]>([]);

  const booksToShow = computed(() => {
    let books = allBooks.value;
    books = filterByBookIds(books);
    books = filterByHighlightColors(books);
    return books;
  });

  watch(
    () => bookCollections.value,
    () => {
      if (
        bookCollectionIdFilter.value &&
        bookCollections.value?.collections.every((c) => c.id !== bookCollectionIdFilter.value)
      ) {
        bookCollectionIdFilter.value = undefined;
      }
    },
  );

  function filterByBookIds(books: KoboBook[]): KoboBook[] {
    if (!bookCollectionIdFilter.value) {
      return books;
    }
    const collection = (bookCollections.value?.collections || []).find((c) => c.id === bookCollectionIdFilter.value);
    if (!collection) {
      return books;
    }
    const filteredBooks = books.filter((book) => collection.bookIds.includes(book.id));
    return sortByList(collection.bookIds, filteredBooks, prop('id'));
  }

  function filterByHighlightColors(books: KoboBook[]): KoboBook[] {
    const colors = highlightColorFilter.value;
    if (!colors.length) {
      return books;
    }
    return books.flatMap((book) => {
      const bookmarks = book.bookmarks.filter((bookmark) => bookmark.color && colors.includes(bookmark.color));
      return bookmarks.length ? [{ ...book, bookmarks }] : [];
    });
  }

  return { bookCollectionIdFilter, highlightColorFilter, booksToShow };
}
