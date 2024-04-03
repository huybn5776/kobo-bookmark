import { ref, computed, Ref, ComputedRef, h } from 'vue';

import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import { CheckboxState } from '@/enum/checkbox-state';
import DeleteMultiBookDialogContent from '@/module/bookmarks/component/DeleteMultiBookDialogContent/DeleteMultiBookDialogContent.vue';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { textToFileDownload } from '@/util/browser-utils';

export function useMultiBookActions({
  allBooks,
  deleteBooks,
}: {
  allBooks: Ref<KoboBook[]>;
  deleteBooks: (books: KoboBook[]) => Promise<void>;
}): {
  selectedBooks: Ref<KoboBook[]>;
  selectedBookIds: ComputedRef<string[]>;
  selectedBooksCheckState: ComputedRef<CheckboxState>;
  showMultiSelectToolbar: ComputedRef<boolean>;
  handleMasterCheckboxClick: () => void;
  onBookSelectChanges: (book: KoboBook, selected: boolean) => void;
  exportSelectedAsText: () => void;
  exportSelectedAsMarkdown: () => void;
  deleteSelected: () => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();

  const selectedBooks = ref<KoboBook[]>([]);
  const selectedBookIds = computed(() => selectedBooks.value.map((b) => b.id));
  const selectedBooksCheckState = computed<CheckboxState>(() => {
    if (!selectedBooks.value.length) {
      return CheckboxState.Unchecked;
    }
    if (selectedBooks.value.length === allBooks.value?.length) {
      return CheckboxState.Checked;
    }
    return CheckboxState.Indeterminate;
  });
  const showMultiSelectToolbar = computed(() => !!selectedBooks.value.length);

  function handleMasterCheckboxClick(): void {
    switch (selectedBooksCheckState.value) {
      case CheckboxState.Unchecked:
        selectedBooks.value = allBooks.value;
        break;
      case CheckboxState.Checked:
      case CheckboxState.Indeterminate:
      default:
        selectedBooks.value = [];
        break;
    }
  }

  function onBookSelectChanges(book: KoboBook, selected: boolean): void {
    if (selected) {
      selectedBooks.value.push(book);
    } else {
      selectedBooks.value = selectedBooks.value.filter((b) => b.id !== book.id);
    }
  }

  function exportSelectedAsText(): void {
    const books = selectedBooks.value;
    const content = bookmarkToText(books);
    textToFileDownload(content, `${getFilenameOfBooks(books)}.txt`, 'text/plain');
  }

  function exportSelectedAsMarkdown(): void {
    const books = selectedBooks.value;
    const content = bookmarkToMarkdown(books);
    textToFileDownload(content, `${getFilenameOfBooks(books)}.md`, 'text/markdown');
  }

  function deleteSelected(): void {
    dialog.warning({
      title: t('common.delete_selected'),
      content: () => h(DeleteMultiBookDialogContent, { books: selectedBooks.value }),
      negativeText: t('common.cancel'),
      positiveText: t('common.yes'),
      onPositiveClick: () => {
        deleteBooks(selectedBooks.value);
        selectedBooks.value = [];
      },
    });
  }

  function getFilenameOfBooks(books: KoboBook[]): string {
    if (books.length === 1) {
      return books[0].info.title || books[0].id;
    }
    return 'bookmarks';
  }

  return {
    selectedBooks,
    selectedBookIds,
    selectedBooksCheckState,
    showMultiSelectToolbar,
    handleMasterCheckboxClick,
    onBookSelectChanges,
    exportSelectedAsText,
    exportSelectedAsMarkdown,
    deleteSelected,
  };
}
