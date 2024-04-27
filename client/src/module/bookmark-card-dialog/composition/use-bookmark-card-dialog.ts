import { h } from 'vue';

import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import BookmarkCardDialog from '@/module/bookmark-card-dialog/component/BookmarkCardDialog/BookmarkCardDialog.vue';
import { focusLastButtonOfDialog } from '@/util/dialog-utils';

export function useBookmarkCardDialog(): {
  openBookmarkCardDialog: (book: KoboBook, bookmark: KoboBookmark) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();

  async function openBookmarkCardDialog(book: KoboBook, bookmark: KoboBookmark): Promise<void> {
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.create_bookmark_card'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(BookmarkCardDialog, {
          book,
          bookmark,
          onCloseClick: () => dialogReactive.destroy(),
        }),
      onAfterEnter: focusLastButtonOfDialog,
    });
  }

  return { openBookmarkCardDialog };
}
