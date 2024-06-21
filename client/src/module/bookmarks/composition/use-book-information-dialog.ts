import { h } from 'vue';

import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import BookInformationDialog from '@/module/bookmarks/component/BookInformationDialog/BookInformationDialog.vue';

export function useBookInformationDialog(): {
  openBookInformationDialog: (book: KoboBook) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();

  function openBookInformationDialog(book: KoboBook): void {
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.book_information'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(BookInformationDialog, {
          book,
          onCloseClick: () => dialogReactive.destroy(),
        }),
    });
  }

  return { openBookInformationDialog };
}
