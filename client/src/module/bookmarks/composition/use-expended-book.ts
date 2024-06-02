import { ref, Ref, ComputedRef, computed } from 'vue';

import { KoboBook } from '@/dto/kobo-book';

export function useExpandedBook({
  books: allBooks,
  gotoBook,
}: {
  books: ComputedRef<KoboBook[]>;
  gotoBook: (bookId: string, options?: ScrollIntoViewOptions) => void;
}): {
  books: ComputedRef<KoboBook[]>;
  expandedBookId: Ref<string | undefined>;
  onExpandedBookUpdated: (book: KoboBook, expanded: boolean) => void;
} {
  const expandedBookId = ref<string>();
  const booksToShow = computed(() => {
    if (expandedBookId.value) {
      return allBooks.value.filter((book) => book.id === expandedBookId.value);
    }
    return allBooks.value;
  });

  function onExpandedBookUpdated(book: KoboBook, expanded: boolean): void {
    if (expanded) {
      expandedBookId.value = book.id;
    } else if (expandedBookId.value) {
      const bookToFocus = expandedBookId.value;
      expandedBookId.value = undefined;
      setTimeout(() => gotoBook(bookToFocus, { block: 'center' }));
    }
  }

  return { expandedBookId, books: booksToShow, onExpandedBookUpdated };
}
