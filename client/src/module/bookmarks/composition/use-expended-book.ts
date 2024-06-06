import { ref, Ref, ComputedRef, computed } from 'vue';

import { KoboBook } from '@/dto/kobo-book';

export function useExpandedBook({ books: allBooks }: { books: ComputedRef<KoboBook[]> }): {
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
      expandedBookId.value = undefined;
    }
  }

  return { expandedBookId, books: booksToShow, onExpandedBookUpdated };
}
