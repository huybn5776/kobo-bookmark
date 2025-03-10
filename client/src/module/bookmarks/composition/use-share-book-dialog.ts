import { h } from 'vue';

import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { useCheckDropboxToken } from '@/composition/use-check-dropbox-token';
import { useRefreshDropboxToken } from '@/composition/use-refresh-dropbox-token';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import BookmarkShareDialog from '@/module/bookmarks/component/BookmarkShareDialog/BookmarkShareDialog.vue';
import { focusLastButtonOfDialog } from '@/util/dialog-utils';

export function useShareBookDialog(): {
  openShareBooksWithDropboxDialog: (books: KoboBook[]) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();

  const { refreshDropboxToken } = useRefreshDropboxToken();
  const { checkIsDropboxReady } = useCheckDropboxToken();

  function openShareBooksWithDropboxDialog(books: KoboBook[]): void {
    if (!checkIsDropboxReady()) {
      return;
    }
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.share_bookmarks'),
      content: () =>
        h(BookmarkShareDialog, {
          books,
          onCloseClick: () => dialogReactive.destroy(),
          onCompleted: () => {
            dialogReactive.showIcon = true;
            dialogReactive.type = 'success';
            dialogReactive.title = t('page.bookmarks.share_link_created');
          },
        }),
      onAfterEnter: focusLastButtonOfDialog,
    });
    if (!refreshDropboxToken()) {
      dialogReactive.destroy();
    }
  }

  return { openShareBooksWithDropboxDialog };
}
