import { h, ref } from 'vue';

import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import BookInformationDialog from '@/module/bookmarks/component/BookInformationDialog/BookInformationDialog.vue';
import { updateBookTitle } from '@/services/bookmark/bookmark-manage.service';

export function useBookInformationDialog({
  updateBookById,
}: {
  updateBookById: (bookId: string, updater: (book: KoboBook) => KoboBook) => void;
}): {
  openBookInformationDialog: (book: KoboBook) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();
  const bookRef = ref<KoboBook>();

  function openBookInformationDialog(book: KoboBook): void {
    bookRef.value = book;

    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.book_information'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(BookInformationDialog, {
          book: bookRef.value || book,
          onTitleUpdated: (title) => {
            updateBookById(book.id, (b) => {
              const updatedBook = updateBookTitle(b, title);
              bookRef.value = updatedBook;
              return updatedBook;
            });
          },
          onCloseClick: () => dialogReactive.destroy(),
        }),
    });
  }

  return { openBookInformationDialog };
}
