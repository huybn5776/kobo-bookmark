import { ref, computed, Ref, ComputedRef, h } from 'vue';

import { useMessage, useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import ActionMessage from '@/component/ActionMessage/ActionMessage.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import { CheckboxState } from '@/enum/checkbox-state';
import DeleteMultiBookDialogContent from '@/module/bookmarks/component/DeleteMultiBookDialogContent/DeleteMultiBookDialogContent.vue';
import { deleteBooksInDb, archiveBooksInDb, cancelArchiveBooksInDb } from '@/services/bookmark/bookmark-manage.service';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { textToFileDownload } from '@/util/browser-utils';
import { saveDataToJsonFile } from '@/util/file-utils';

export function useMultiBookActions({
  allBooks,
  reloadBooks,
}: {
  allBooks: Ref<KoboBook[]>;
  reloadBooks: () => Promise<void>;
}): {
  selectedBooks: Ref<KoboBook[]>;
  selectedBookIds: ComputedRef<string[]>;
  selectedBooksCheckState: ComputedRef<CheckboxState>;
  showMultiSelectToolbar: ComputedRef<boolean>;
  handleMasterCheckboxClick: () => void;
  onBookSelectChanges: (book: KoboBook, selected: boolean) => void;
  exportSelectedAsText: () => void;
  exportSelectedAsMarkdown: () => void;
  exportSelectedAsFile: () => void;
  archiveSelected: () => void;
  deleteSelected: () => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();
  const message = useMessage();

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

  function exportSelectedAsFile(): void {
    const books = selectedBooks.value;
    saveDataToJsonFile(books, { fileName: 'kobo-books' });
  }

  async function archiveSelected(): Promise<void> {
    await archiveBooks(selectedBooks.value);
    selectedBooks.value = [];
  }

  function deleteSelected(): void {
    dialog.warning({
      title: t('common.delete_selected'),
      content: () => h(DeleteMultiBookDialogContent, { books: selectedBooks.value }),
      negativeText: t('common.cancel'),
      positiveText: t('common.yes'),
      onPositiveClick: async () => {
        const booksCount = selectedBooks.value.length;
        await deleteBooks(selectedBooks.value);
        selectedBooks.value = [];
        message.info(t('page.bookmarks.books_deleted', [booksCount], booksCount));
      },
    });
  }

  function getFilenameOfBooks(books: KoboBook[]): string {
    if (books.length === 1) {
      return books[0].info.title || books[0].id;
    }
    return 'bookmarks';
  }

  async function archiveBooks(books: KoboBook[]): Promise<void> {
    const bookIds = books.map((book) => book.id);
    await archiveBooksInDb(bookIds);
    message.destroyAll();
    const messageReactive = message.info(
      () =>
        h(ActionMessage, {
          content: t('page.bookmarks.books_archived', [books.length], books.length),
          action: t('common.undo'),
          onClick: async () => {
            await cancelArchiveBooksInDb(bookIds);
            await reloadBooks();
            messageReactive.destroy();
          },
        }),
      { closable: true, duration: 10000 },
    );
    await reloadBooks();
  }

  async function deleteBooks(books: KoboBook[]): Promise<void> {
    await deleteBooksInDb(books.map((book) => book.id));
    await reloadBooks();
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
    exportSelectedAsFile,
    archiveSelected,
    deleteSelected,
  };
}
