import { Ref, ComputedRef, computed, provide, watch } from 'vue';

import * as E from 'fp-ts/Either';
import { useRouter, useRoute } from 'vue-router';

import { useRouterParam } from '@/composition/use-router-param';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { provideExpandedBookId } from '@/symbols';
import { decodeBookId, encodeBookId } from '@/util/book-id-encode';

export function useExpandedBook({
  books: allBooks,
  setMessage,
  activeBookCollection,
}: {
  books: Ref<KoboBook[]> | ComputedRef<KoboBook[]>;
  setMessage: (message: string) => void;
  activeBookCollection?: ComputedRef<BookCollection | undefined>;
}): {
  books: ComputedRef<KoboBook[]>;
  expandedBookId: ComputedRef<string | undefined>;
  updateExpandedBookId: (id: string | undefined) => void;
  onExpandedBookUpdated: (book: KoboBook, expanded: boolean) => void;
} {
  const route = useRoute();
  const router = useRouter();

  const expandedBookIdParam = useRouterParam<string>('bookId');
  const expandedBookId = computed(() =>
    expandedBookIdParam.value ? handleIdDecode(expandedBookIdParam.value) : undefined,
  );
  provide(provideExpandedBookId, expandedBookId);

  watch(
    () => [activeBookCollection?.value, expandedBookId.value],
    () => {
      if (
        activeBookCollection?.value &&
        expandedBookId.value &&
        !activeBookCollection?.value.bookIds.includes(expandedBookId.value)
      ) {
        router.push({ name: route.name as string, params: { ...route.params, bookId: undefined } });
      }
    },
  );

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
