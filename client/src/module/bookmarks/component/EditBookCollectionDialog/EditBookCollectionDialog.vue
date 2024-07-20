<template>
  <div class="edit-book-collection-dialog">
    <div class="edit-book-collection-dialog-content">
      <div class="edit-book-collection-dialog-row">
        <i18n-t keypath="common.name" />
        <span>*</span>
        <NInput v-model:value="bookCollection.name" aria-required="true" placeholder="" />
      </div>
      <div class="edit-book-collection-dialog-row">
        <i18n-t keypath="common.books" />
        <NSelect
          clearable
          filterable
          multiple
          placeholder=""
          placement="top-start"
          :ellipsisTagPopoverProps="{ disabled: true }"
          :maxTagCount="0"
          :options="bookOptions"
          :value="selectedBookIds"
          @update:value="onBookSelected"
        />
      </div>

      <div class="book-collection-container">
        <span v-if="!bookCollectionBooks.length" class="book-collection-placeholder">
          <span>(</span>
          <i18n-t keypath="page.bookmarks.no_selected_book" />
          <span>)</span>
        </span>
        <ListDragSort v-slot:default="{ item }" :items="bookCollectionBooks" @update:items="onSortChanged($event)">
          <div class="book-collection">
            <span class="book-collection-name">{{ item.info.title }}</span>
            <NButton class="book-delete-button" secondary round @click="removeBookFromCollection(item)">
              <CloseIcon class="icon-16" />
              <i18n-t keypath="common.delete" />
            </NButton>
          </div>
        </ListDragSort>
      </div>
    </div>

    <p class="edit-book-collection-dialog-message">{{ errorMessage }}</p>

    <div class="edit-book-collection-dialog-actions">
      <NButton
        v-if="collectionId"
        class="edit-book-collection-dialog-delete-button"
        size="small"
        type="error"
        secondary
        @click="emit('deleteClick', bookCollection)"
      >
        <i18n-t keypath="common.delete" />
      </NButton>
      <NButton size="small" @click="emit('closeClick')">
        <i18n-t keypath="common.close" />
      </NButton>
      <NButton size="small" @click="emit('manageCollectionsClick')">
        <i18n-t keypath="page.bookmarks.manage_book_collections" />
      </NButton>
      <NButton size="small" type="primary" @click="save">
        <i18n-t keypath="common.save" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';

import { NInput, NButton, NSelect, SelectOption } from 'naive-ui';
import { sortBy, indexBy, prop, identity } from 'ramda';
import { useI18n } from 'vue-i18n';

import { CloseIcon } from '@/component/icon';
import ListDragSort from '@/component/ListDragSort/ListDragSort.vue';
import { useCmdEnterHotkey } from '@/composition/use-cmd-enter-hotkey';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import { getSettingFromStorage } from '@/services/setting.service';
import { sortByList } from '@/util/array-urils';
import { generateUuid } from '@/util/id-utils';
import { deepToRaw } from '@/util/vue-utils';

const props = defineProps<{ allBooks: KoboBook[]; collectionId?: string; presetBookIds?: string[] }>();
const emit = defineEmits<{
  (e: 'deleteClick', value: BookCollection): void;
  (e: 'closeClick'): void;
  (e: 'manageCollectionsClick'): void;
  (e: 'saveClick', value: BookCollection): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const bookCollection = ref<BookCollection>(
  getSettingFromStorage(SettingKey.BookCollection)?.collections.find((c) => c.id === props.collectionId) ?? {
    id: generateUuid(),
    name: '',
    bookIds: props.presetBookIds || [],
    updatedAt: new Date(),
  },
);
const errorMessage = ref<string>();

const sortedBooks = computed(() => sortBy((book) => book.info.title || '', props.allBooks));
const bookOptions = computed<SelectOption[]>(() => {
  return sortedBooks.value.map((book) => ({ value: book.id, label: book.info.title }));
});
const selectedBookIds = computed(() => bookCollection.value.bookIds);
const bookCollectionBooks = computed<KoboBook[]>(() => {
  const booksMap = indexBy(prop('id'), sortedBooks.value);
  return bookCollection.value.bookIds.map((id) => booksMap[id]);
});

useCmdEnterHotkey(save);

watch(
  () => bookCollection.value,
  () => (errorMessage.value = ''),
);

function removeBookFromCollection(book: KoboBook): void {
  bookCollection.value.bookIds = bookCollection.value.bookIds.filter((bookId) => bookId !== book.id);
}

function save(): void {
  const collection = bookCollection.value;
  if (!collection.name) {
    errorMessage.value = t('page.bookmarks.collection_name_is_required');
    return;
  }
  const nameDuplicated = getSettingFromStorage(SettingKey.BookCollection)?.collections.some(
    (c) => c.id !== collection.id && c.name === collection.name,
  );
  if (nameDuplicated) {
    errorMessage.value = t('page.bookmarks.collection_name_duplicated');
    return;
  }
  emit('saveClick', deepToRaw(bookCollection.value));
}

function onBookSelected(bookIds: string[]): void {
  bookCollection.value.bookIds = sortByList(bookCollection.value.bookIds, bookIds, identity);
}

function onSortChanged(books: KoboBook[]): void {
  bookCollection.value.bookIds = books.map(prop('id'));
}
</script>

<style lang="scss" scoped>
@import './EditBookCollectionDialog';
</style>
