import { ref, ComponentInstance, ComponentPublicInstance, nextTick, ComputedRef, Ref } from 'vue';

import VirtualList from '@/component/VirtualList/VirtualList.vue';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import BookBookmark from '@/module/bookmarks/component/BookBookmark/BookBookmark.vue';

export function useGoToBook({
  booksToShow,
  expandedBookId,
  expandBook,
}: {
  booksToShow: ComputedRef<KoboBook[]>;
  expandedBookId: ComputedRef<string | undefined>;
  expandBook: (bookId: string | undefined) => void;
}): {
  virtualListRef: Ref<ComponentInstance<typeof VirtualList<KoboBook, 'id'>> | undefined>;
  setBookBookmarkRef: (nodeRef: Element | ComponentPublicInstance | null) => void;
  gotoBook: (bookId: string) => void;
  gotoBookmark: (book: KoboBook, bookmark: KoboBookmark) => void;
  expandBook: (bookId: string) => void;
} {
  const virtualListRef = ref<ComponentInstance<typeof VirtualList<KoboBook, 'id'>>>();
  const bookBookmarkRefs = ref<Record<string, InstanceType<typeof BookBookmark>>>({});

  function setBookBookmarkRef(nodeRef: Element | ComponentPublicInstance | null): void {
    const bookBookmarkInstance = nodeRef as ComponentInstance<typeof BookBookmark> | undefined;
    if (bookBookmarkInstance) {
      bookBookmarkRefs.value[bookBookmarkInstance?.book.id] = bookBookmarkInstance;
    }
  }

  function gotoBook(bookId: string): void {
    const virtualList = virtualListRef.value;
    if (!virtualList) {
      return;
    }
    const bookIndex = booksToShow.value.findIndex((book) => book.id === bookId);
    const action = (): void => (virtualList as { scrollTo: (index: number) => void }).scrollTo(bookIndex);
    if (expandedBookId.value === bookId) {
      action();
    } else {
      expandBook(undefined);
      nextTick(action);
    }
  }

  function gotoBookmark(book: KoboBook, bookmark: KoboBookmark): void {
    if (expandedBookId.value !== book.id) {
      expandBook(book.id);
      nextTick(() => bookBookmarkRefs.value[book.id]?.scrollToBookmark(bookmark, { block: 'center' }));
    } else {
      bookBookmarkRefs.value[book.id]?.scrollToBookmark(bookmark, { behavior: 'smooth', block: 'center' });
    }
  }

  return { virtualListRef, setBookBookmarkRef, gotoBook, gotoBookmark, expandBook };
}
