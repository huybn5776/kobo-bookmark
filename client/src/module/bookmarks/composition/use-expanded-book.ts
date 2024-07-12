import { Ref, ComputedRef, computed, provide } from 'vue';

import * as E from 'fp-ts/Either';

import { useRouterParam } from '@/composition/use-router-param';
import { KoboBook } from '@/dto/kobo-book';
import { provideExpandedBookId } from '@/symbols';
import { decodeBookId, encodeBookId } from '@/util/book-id-encode';

export function useExpandedBook({
  books: allBooks,
  setMessage,
}: {
  books: Ref<KoboBook[]> | ComputedRef<KoboBook[]>;
  setMessage: (message: string) => void;
}): {
  books: ComputedRef<KoboBook[]>;
  expandedBookId: ComputedRef<string | undefined>;
  updateExpandedBookId: (id: string | undefined) => void;
  onExpandedBookUpdated: (book: KoboBook, expanded: boolean) => void;
} {
  const expandedBookIdParam = useRouterParam<string>('bookId');
  const expandedBookId = computed(() =>
    expandedBookIdParam.value ? handleIdDecode(expandedBookIdParam.value) : undefined,
  );
  provide(provideExpandedBookId, expandedBookId);

  const booksToShow = computed(() => {
    if (expandedBookIdParam.value) {
      const id = handleIdDecode(expandedBookIdParam.value);
      return id ? allBooks.value.filter((book) => book.id === id) : [];
    }
    return allBooks.value;
  });

  function handleIdDecode(encodedId: string): string | undefined {
    const result = decodeBookId(encodedId);
    if (E.isLeft(result)) {
      setMessage(result.left);
      return undefined;
    }
    return result.right;
  }

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
