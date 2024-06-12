import { ref, Ref } from 'vue';

import { useEventListener } from '@vueuse/core';

import { KoboBook } from '@/dto/kobo-book';

export function useBookSearchModal({
  gotoBook,
  expandBook,
}: {
  gotoBook: (bookId: string) => void;
  expandBook: (bookId: string) => void;
}): {
  showBookSearchModal: Ref<boolean>;
  onBookModalSelect: (book: KoboBook) => void;
  onBookModalAlterSelect: (book: KoboBook) => void;
} {
  const showBookSearchModal = ref<boolean>(false);

  useEventListener(document, 'keydown', (event: KeyboardEvent) => {
    if (
      !showBookSearchModal.value &&
      (event.ctrlKey || event.metaKey) &&
      !event.shiftKey &&
      !event.altKey &&
      event.code === 'KeyE'
    ) {
      openModal();
    } else if (showBookSearchModal.value && event.code === 'Escape') {
      closeModal();
    }
  });

  function onBookModalSelect(book: KoboBook): void {
    expandBook(book.id);
    closeModal();
  }

  function onBookModalAlterSelect(book: KoboBook): void {
    gotoBook(book.id);
  }

  function openModal(): void {
    showBookSearchModal.value = true;
  }

  function closeModal(): void {
    showBookSearchModal.value = false;
  }

  return { showBookSearchModal, onBookModalSelect, onBookModalAlterSelect };
}
