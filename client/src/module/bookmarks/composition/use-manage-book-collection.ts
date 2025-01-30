import { h, Ref } from 'vue';

import { useDialog, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import ActionMessage from '@/component/ActionMessage/ActionMessage.vue';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import AddBookToCollectionDialog from '@/module/bookmarks/component/AddBookToCollectionDialog/AddBookToCollectionDialog.vue';
import EditBookCollectionDialog from '@/module/bookmarks/component/EditBookCollectionDialog/EditBookCollectionDialog.vue';
import ManageBookCollectionDialog from '@/module/bookmarks/component/ManageBookCollectionDialog/ManageBookCollectionDialog.vue';
import { focusLastButtonOfDialog, focusFirstInputOfDialog } from '@/util/dialog-utils';

export function useManageBookCollection({
  allBooks,
  selectedBookIds,
  bookCollectionIdFilter,
}: {
  allBooks: Ref<KoboBook[]>;
  selectedBookIds: Ref<string[]>;
  bookCollectionIdFilter: Ref<string | undefined>;
}): {
  handleCreateCollection: () => void;
  handleEditCollection: (collectionId: string) => void;
  removeSelectionFromCollection: () => void;
  addSelectionToCollection: () => void;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();
  const message = useMessage();

  const bookCollections = useSyncSetting(SettingKey.BookCollection);

  function handleCreateCollection(presetBookIds?: string[]): void {
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.create_collection'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(EditBookCollectionDialog, {
          allBooks: allBooks.value,
          presetBookIds,
          onCloseClick: () => dialogReactive.destroy(),
          onManageCollectionsClick: () => {
            openManageBookCollectionDialog();
            dialogReactive.destroy();
          },
          onSaveClick: (collection) => {
            upsertBookCollection(collection);
            message.success(t('page.bookmarks.collection_created', [collection.name]));
            dialogReactive.destroy();
          },
        }),
      onAfterEnter: focusFirstInputOfDialog,
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
          onManageCollectionsClick: () => {
            openManageBookCollectionDialog();
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
    const collections: BookCollection[] = bookCollections.value?.collections ?? [];
    const existingIndex = collections.findIndex((c) => c.id === collection.id);
    if (existingIndex === -1) {
      collections.push(collection);
    } else {
      collections[existingIndex] = collection;
    }
    bookCollections.value = { collections, updatedAt: new Date() };
  }

  function deleteBookCollection(collectionId: string): void {
    let collections: BookCollection[] = bookCollections.value?.collections ?? [];
    collections = collections.filter((c) => c.id !== collectionId);
    bookCollections.value = { collections, updatedAt: new Date() };
  }

  function addSelectionToCollection(): void {
    const bookIdsToAdd = selectedBookIds.value;

    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.add_to_book_collection'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(AddBookToCollectionDialog, {
          bookIds: bookIdsToAdd,
          bookCollections: bookCollections.value?.collections ?? [],
          onCreateCollectionClick: () => {
            handleCreateCollection(bookIdsToAdd);
            dialogReactive.destroy();
          },
          onCancelClick: () => dialogReactive.destroy(),
          onCollectionClick: (collection) => {
            const addedBookIds = addBooksToCollection(bookIdsToAdd, collection.id);
            message.success(
              t(
                'page.bookmarks.books_added_to_collection',
                [addedBookIds.length, collection.name],
                addedBookIds.length,
              ),
            );
            dialogReactive.destroy();
          },
        }),
    });
  }

  function removeSelectionFromCollection(): void {
    if (!bookCollectionIdFilter.value) {
      return;
    }
    const collection = getCollectionById(bookCollectionIdFilter.value);
    if (!collection) {
      return;
    }
    const bookIdsToRemove = selectedBookIds.value;
    removeBooksFromCollection(bookIdsToRemove, bookCollectionIdFilter.value);
    const messageReactive = message.success(() =>
      h(ActionMessage, {
        content: t(
          'page.bookmarks.books_removed_from_collection',
          [bookIdsToRemove.length, collection.name],
          bookIdsToRemove.length,
        ),
        action: t('common.undo'),
        onClick: () => {
          upsertBookCollection(collection);
          messageReactive.destroy();
        },
      }),
    );
  }

  function openManageBookCollectionDialog(): void {
    const dialogReactive = dialog.create({
      showIcon: false,
      title: t('page.bookmarks.manage_book_collections'),
      style: { width: '600px', maxWidth: '90vw' },
      content: () =>
        h(ManageBookCollectionDialog, {
          collections: bookCollections.value?.collections ?? [],
          onCloseClick: () => dialogReactive.destroy(),
          onSaveClick: (collections) => {
            bookCollections.value = { collections, updatedAt: new Date() };
            message.success(t('page.bookmarks.collections_updated'));
            dialogReactive.destroy();
          },
        }),
      onAfterEnter: focusLastButtonOfDialog,
    });
  }

  function addBooksToCollection(bookIds: string[], collectionId: string): string[] {
    const targetCollection = getCollectionById(collectionId);
    if (!targetCollection) {
      return [];
    }
    const bookIdsToAdd = bookIds.filter((bookId) => !targetCollection.bookIds.includes(bookId));
    const updatedCollection = { ...targetCollection };
    updatedCollection.bookIds.push(...bookIdsToAdd);
    upsertBookCollection(updatedCollection);
    return bookIdsToAdd;
  }

  function removeBooksFromCollection(bookIds: string[], collectionId: string): void {
    const targetCollection = getCollectionById(collectionId);
    if (!targetCollection) {
      return;
    }
    const updatedCollection = { ...targetCollection };
    updatedCollection.bookIds = updatedCollection.bookIds.filter((bookId) => !bookIds.includes(bookId));
    upsertBookCollection(updatedCollection);
  }

  function getCollectionById(id: string): BookCollection | undefined {
    const collections: BookCollection[] = bookCollections.value?.collections ?? [];
    return collections.find((c) => c.id === id);
  }

  return { handleCreateCollection, handleEditCollection, addSelectionToCollection, removeSelectionFromCollection };
}
