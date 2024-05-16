import { h, Ref } from 'vue';

import { useDialog , useMessage} from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import EditBookCollectionDialog from '@/module/bookmarks/component/EditBookCollectionDialog/EditBookCollectionDialog.vue';
import { focusLastButtonOfDialog } from '@/util/dialog-utils';

export function useManageBookCollection({ allBooks }: { allBooks: Ref<KoboBook[]> }): {
  handleCreateCollection: () => void;
  handleEditCollection: (collectionId: string) => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();
  const message = useMessage();

  const bookCollections = useSyncSetting(SettingKey.BookCollection);

  function handleCreateCollection(): void {
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.create_collection'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(EditBookCollectionDialog, {
          allBooks: allBooks.value,
          onCloseClick: () => dialogReactive.destroy(),
          onSaveClick: (collection) => {
            upsertBookCollection(collection);
            message.success(t('page.bookmarks.collection_created', [collection.name]));
            dialogReactive.destroy();
          },
        }),
      onAfterEnter: focusLastButtonOfDialog,
    });
  }

  function handleEditCollection(collectionId: string): void {
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.edit_collection'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(EditBookCollectionDialog, {
          allBooks: allBooks.value,
          collectionId,
          onDeleteClick: (collection) => {
            deleteBookCollection(collection.id);
            const messageReactive = message.info(() =>
              h(ActionMessage, {
                content: t('page.bookmarks.collection_deleted', [collection.name]),
                action: t('common.undo'),
                onClick: () => {
                  upsertBookCollection(collection);
                  messageReactive.destroy();
                },
              }),
            );
            dialogReactive.destroy();
          },
          onCloseClick: () => dialogReactive.destroy(),
          onSaveClick: (collection) => {
            upsertBookCollection(collection);
            message.success(t('page.bookmarks.collection_updated', [collection.name]));
            dialogReactive.destroy();
          },
        }),
    });
  }

  function upsertBookCollection(collection: BookCollection): void {
    const collections: BookCollection[] = bookCollections.value?.collections || [];
    const existingIndex = collections.findIndex((c) => c.id === collection.id);
    if (existingIndex === -1) {
      collections.push(collection);
    } else {
      collections[existingIndex] = collection;
    }
    bookCollections.value = { collections, updatedAt: new Date() };
  }

  function deleteBookCollection(collectionId: string): void {
    let collections: BookCollection[] = bookCollections.value?.collections || [];
    collections = collections.filter((c) => c.id !== collectionId);
    bookCollections.value = { collections, updatedAt: new Date() };
  }

  return { handleCreateCollection, handleEditCollection };
}
