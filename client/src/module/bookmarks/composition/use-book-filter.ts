import { ref, Ref, computed, ComputedRef, watch } from 'vue';

import { prop } from 'ramda';
import { useRouter, useRoute } from 'vue-router';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import { sortByList } from '@/util/array-urils';

export function useBookFilter({ books: allBooks }: { books: Ref<KoboBook[]> }): {
  books: ComputedRef<KoboBook[]>;
  bookCollectionIdFilter: Ref<string | undefined>;
  highlightColorFilter: Ref<HighlightColor[]>;
  activeBookCollection: ComputedRef<BookCollection | undefined>;
} {
  const route = useRoute();
  const router = useRouter();

  const bookCollections = useSyncSetting(SettingKey.BookCollection);

  const bookCollectionIdFilter = ref<string | undefined>(route.params.collectionId as string);
  const highlightColorFilter = ref<HighlightColor[]>([]);

  const booksToShow = computed(() => {
    let books = allBooks.value;
    books = filterByBookIds(books);
    books = filterByHighlightColors(books);
    return books;
  });
  const activeBookCollection = computed<BookCollection | undefined>(() => {
    return bookCollectionIdFilter.value
      ? (bookCollections.value?.collections || []).find((c) => c.id === bookCollectionIdFilter.value)
      : undefined;
  });

  watch(
    () => route.params.collectionId,
    (collectionId) => (bookCollectionIdFilter.value = collectionId as string),
  );
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
  watch(
    () => bookCollectionIdFilter.value,
    () => {
      if (bookCollectionIdFilter.value) {
        router.push({ name: 'collections', params: { collectionId: bookCollectionIdFilter.value } });
      } else {
        router.push({ name: 'bookmarks' });
      }
    },
  );

  function filterByBookIds(books: KoboBook[]): KoboBook[] {
    if (bookCollectionIdFilter.value && !activeBookCollection.value) {
      return [];
    }
    if (!activeBookCollection.value) {
      return books;
    }
    const collection = activeBookCollection.value;
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

  return { bookCollectionIdFilter, highlightColorFilter, books: booksToShow, activeBookCollection };
}
