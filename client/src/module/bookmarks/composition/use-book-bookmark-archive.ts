import { h } from 'vue';

import { useMessage, MessageReactive } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import ActionMessage from '@/component/ActionMessage/ActionMessage.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { archiveBooksInDb, cancelArchiveBooksInDb, updateBookmark } from '@/services/bookmark/bookmark-manage.service';

export function useBookBookmarkArchive({ reloadBooks }: { reloadBooks: () => void }): {
  archiveBook: (book: KoboBook) => Promise<void>;
  cancelArchiveBook: (book: KoboBook) => Promise<void>;
  archiveBookmark: (book: KoboBook, bookmark: KoboBookmark) => Promise<void>;
  cancelArchiveBookmark: (book: KoboBook, bookmark: KoboBookmark) => Promise<void>;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const message = useMessage();

  async function archiveBookWithMessage(book: KoboBook): Promise<void> {
    await archiveBook(book);
    showUndoableMessage(t('page.bookmarks.book_archived'), () => cancelArchiveBook(book));
  }

  async function cancelArchiveBookWithMessage(book: KoboBook): Promise<void> {
    await cancelArchiveBook(book);
    showUndoableMessage(t('page.bookmarks.book_cancel_archived'), () => archiveBook(book));
  }

  async function archiveBookmarkWithMessage(book: KoboBook, bookmark: KoboBookmark): Promise<void> {
    await archiveBookmark(book, bookmark);
    showUndoableMessage(t('page.bookmarks.bookmark_archived'), () => cancelArchiveBookmark(book, bookmark));
  }

  async function cancelArchiveBookmarkWithMessage(book: KoboBook, bookmark: KoboBookmark): Promise<void> {
    await cancelArchiveBookmark(book, bookmark);
    showUndoableMessage(t('page.bookmarks.bookmark_cancel_archived'), () => archiveBookmark(book, bookmark));
  }

  async function archiveBookmark(book: KoboBook, bookmark: KoboBookmark): Promise<void> {
    await updateBookmark(book.id, bookmark.id, (b) => ({ ...b, isArchived: true }));
    reloadBooks();
  }

  async function cancelArchiveBookmark(book: KoboBook, bookmark: KoboBookmark): Promise<void> {
    await updateBookmark(book.id, bookmark.id, (b) => ({ ...b, isArchived: false }));
    reloadBooks();
  }

  async function archiveBook(book: KoboBook): Promise<void> {
    await archiveBooksInDb([book.id]);
    reloadBooks();
  }

  async function cancelArchiveBook(book: KoboBook): Promise<void> {
    await cancelArchiveBooksInDb([book.id]);
    reloadBooks();
  }

  function showUndoableMessage(content: string, undoAction: () => Promise<void>): MessageReactive {
    message.destroyAll();
    const messageReactive = message.info(
      () =>
        h(ActionMessage, {
          content,
          action: t('common.undo'),
          onClick: async () => {
            await undoAction();
            messageReactive.destroy();
          },
        }),
      { closable: true, duration: 10000 },
    );
    return messageReactive;
  }

  return {
    archiveBook: archiveBookWithMessage,
    cancelArchiveBook: cancelArchiveBookWithMessage,
    archiveBookmark: archiveBookmarkWithMessage,
    cancelArchiveBookmark: cancelArchiveBookmarkWithMessage,
  };
}
