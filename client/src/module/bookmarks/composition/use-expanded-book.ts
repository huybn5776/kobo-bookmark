import { Ref, ComputedRef, computed } from 'vue';

import { useRouterParam } from '@/composition/use-router-param';
import { KoboBook } from '@/dto/kobo-book';
import { decodeBookId, encodeBookId } from '@/util/book-id-encode';

export function useExpandedBook({ books: allBooks }: { books: ComputedRef<KoboBook[]> }): {
  books: ComputedRef<KoboBook[]>;
  expandedBookId: ComputedRef<string | undefined>;
  updateExpandedBookId: (id: string | undefined) => void;
  onExpandedBookUpdated: (book: KoboBook, expanded: boolean) => void;
} {
  const expandedBookIdParam = useRouterParam<string>('bookId');
  const expandedBookId = computed(() =>
    expandedBookIdParam.value ? decodeBookId(expandedBookIdParam.value) : undefined,
  );

  const booksToShow = computed(() => {
    if (expandedBookIdParam.value) {
      const id = decodeBookId(expandedBookIdParam.value);
      return allBooks.value.filter((book) => book.id === id);
    }
    return allBooks.value;
  });

  function onExpandedBookUpdated(book: KoboBook, expanded: boolean): void {
    if (expanded) {
      expandedBookIdParam.value = encodeBookId(book.id);
    } else if (expandedBookIdParam.value) {
      expandedBookIdParam.value = undefined;
    }
  }

  function updateExpandedBookId(id: string | undefined): void {
    expandedBookIdParam.value = id ? encodeBookId(id) : undefined;
  }

  return { expandedBookId, books: booksToShow, updateExpandedBookId, onExpandedBookUpdated };
}
