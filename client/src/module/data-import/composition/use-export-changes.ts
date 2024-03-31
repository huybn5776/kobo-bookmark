import { Ref } from 'vue';

import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges, KoboBook } from '@/dto/kobo-book';
import { bookmarkToText, bookmarkToMarkdown } from '@/services/export/bookmark-export.service';
import { textToFileDownload, textToClipboard } from '@/util/browser-utils';

export function useExportChanges({ bookChanges }: { bookChanges: Ref<KoboBookChanges[]> }): {
  exportChangeAsMarkdownFile: () => void;
  exportChangeAsTextClipboard: () => Promise<void>;
  exportChangeAsTextFile: () => void;
  exportChangeAsMarkdownClipboard: () => Promise<void>;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const message = useMessage();

  function exportChangeAsTextFile(): void {
    exportChanges((books) =>
      textToFileDownload(bookmarkToText(books), `${getFilenameOfBooks(books)}.txt`, 'text/plain'),
    );
  }

  async function exportChangeAsTextClipboard(): Promise<void> {
    exportChanges(async (books) => {
      await textToClipboard(bookmarkToText(books));
      message.info(t('page.data_import.bookmark_copied', [books.length], books.length));
    });
  }

  function exportChangeAsMarkdownFile(): void {
    exportChanges((books) =>
      textToFileDownload(bookmarkToMarkdown(books), `${getFilenameOfBooks(books)}.md`, 'text/markdown'),
    );
  }

  async function exportChangeAsMarkdownClipboard(): Promise<void> {
    exportChanges(async (books) => {
      await textToClipboard(bookmarkToMarkdown(books));
      message.info(t('page.data_import.bookmark_copied', [books.length], books.length));
    });
  }

  function exportChanges(action: (books: KoboBook[]) => void): void {
    const books = changesToBooks();
    const bookmarks = books.flatMap((book) => book.bookmarks);
    if (bookmarks.length) {
      action(books);
    } else {
      message.warning(t('page.data_import.no_changes_to_export'));
    }
  }

  function changesToBooks(): KoboBook[] {
    return bookChanges.value.map((changes) => {
      const book: KoboBook = {
        ...changes.book,
        bookmarks: changes.changes.flatMap((bookmark) => (bookmark.current ? [bookmark.current] : [])),
      };
      return book;
    });
  }

  function getFilenameOfBooks(books: KoboBook[]): string {
    if (books.length === 1) {
      return books[0].info.title || books[0].id;
    }
    return 'bookmarks';
  }

  return {
    exportChangeAsTextFile,
    exportChangeAsTextClipboard,
    exportChangeAsMarkdownFile,
    exportChangeAsMarkdownClipboard,
  };
}
