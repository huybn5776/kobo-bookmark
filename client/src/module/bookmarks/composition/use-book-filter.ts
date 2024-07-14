import { ref, Ref, computed, ComputedRef, watch, provide } from 'vue';

import { prop } from 'ramda';
import { useRouter, useRoute } from 'vue-router';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import { provideActiveCollection } from '@/symbols';
import { sortByList } from '@/util/array-urils';

export function useBookFilter({ books: allBooks }: { books: Ref<KoboBook[]> }): {
  books: ComputedRef<KoboBook[]>;
  bookCollectionIdFilter: Ref<string | undefined>;
  tagFilter: Ref<string | undefined>;
  highlightColorFilter: Ref<HighlightColor[]>;
  activeBookCollection: ComputedRef<BookCollection | undefined>;
  toggleTagFilter: (title: string) => void;
} {
  const route = useRoute();
  const router = useRouter();

  const bookCollections = useSyncSetting(SettingKey.BookCollection);

  const bookCollectionIdFilter = ref<string | undefined>(route.params.collectionId as string);
  const tagFilter = ref<string | undefined>(route.params.tagId as string);
  const highlightColorFilter = ref<HighlightColor[]>([]);

  const booksToShow = computed(() => {
    let books = allBooks.value;
    books = filterByBookIds(books);
    books = filterByTags(books);
    books = filterByHighlightColors(books);
    return books;
  });
  const activeBookCollection = computed<BookCollection | undefined>(() => {
    return bookCollectionIdFilter.value
      ? (bookCollections.value?.collections || []).find((c) => c.id === bookCollectionIdFilter.value)
      : undefined;
  });
  provide(provideActiveCollection, activeBookCollection);

  watch(
    () => route.params.collectionId,
    (collectionId) => (bookCollectionIdFilter.value = collectionId as string),
  );
  watch(
    () => route.params.tagId,
    (tagId) => (tagFilter.value = tagId as string),
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
    () => (tagFilter.value = undefined),
  );
  watch(
    () => [bookCollectionIdFilter.value, tagFilter.value],
    () => {
      const { bookId } = route.params;
      if (bookCollectionIdFilter.value && tagFilter.value) {
        router.push({
          name: 'collectionWithTag',
          params: { collectionId: bookCollectionIdFilter.value, tagId: tagFilter.value, bookId },
        });
      } else if (bookCollectionIdFilter.value) {
        router.push({ name: 'collections', params: { collectionId: bookCollectionIdFilter.value, bookId } });
      } else if (tagFilter.value) {
        router.push({ name: 'tags', params: { tagId: tagFilter.value, bookId } });
      } else {
        router.push({ name: 'bookmarks', params: { bookId } });
      }
    },
  );

  function toggleTagFilter(title: string): void {
    tagFilter.value = tagFilter.value === title ? undefined : title;
  }

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

  function filterByTags(books: KoboBook[]): KoboBook[] {
    const tagTitle = tagFilter.value;
    if (!tagTitle) {
      return books;
    }
    return books.flatMap((book) => {
      const bookmarks = book.bookmarks.filter(
        (bookmark) => bookmark.tags && bookmark.tags.some((tag) => tag.title === tagTitle),
      );
      return bookmarks.length ? [{ ...book, bookmarks }] : [];
    });
  }

  function filterByHighlightColors(books: KoboBook[]): KoboBook[] {
    const colors = highlightColorFilter.value;
    if (!colors?.length) {
      return books;
    }
    return books.flatMap((book) => {
      const bookmarks = book.bookmarks.filter((bookmark) => bookmark.color && colors.includes(bookmark.color));
      return bookmarks.length ? [{ ...book, bookmarks }] : [];
    });
  }

  return {
    bookCollectionIdFilter,
    tagFilter,
    highlightColorFilter,
    books: booksToShow,
    activeBookCollection,
    toggleTagFilter,
  };
}
