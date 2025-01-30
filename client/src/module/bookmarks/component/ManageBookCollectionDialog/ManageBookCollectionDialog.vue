<template>
  <div class="manage-book-collection-order-dialog">
    <div class="manage-book-collection-order-dialog-content">
      <p v-if="!bookCollections.length" class="manage-book-collection-empty-view">
        <i18n-t keypath="page.bookmarks.no_any_book_collections" />
      </p>

      <ListDragSort v-slot="{ item }" :items="bookCollections" @update:items="onSortChanged($event)">
        <div class="book-collection">
          <span class="book-collection-name">{{ item.name }} ({{ item.bookIds.length }})</span>
          <NButton class="book-collection-delete-button" secondary round @click="deleteCollection(item)">
            <Icon name="close" class="icon-16" />
            <i18n-t keypath="common.delete" />
          </NButton>
        </div>
      </ListDragSort>
    </div>

    <div class="manage-book-collection-dialog-actions">
      <NButton size="small" @click="emit('closeClick')">
        <i18n-t keypath="common.close" />
      </NButton>
      <NButton size="small" type="primary" @click="save">
        <i18n-t keypath="common.save" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { NButton } from 'naive-ui';

import Icon from '@/component/icon/Icon.vue';
import ListDragSort from '@/component/ListDragSort/ListDragSort.vue';
import { BookCollection } from '@/dto/book-collection';

const props = defineProps<{ collections: BookCollection[] }>();
const emit = defineEmits<{ (e: 'closeClick'): void; (e: 'saveClick', value: BookCollection[]): void }>();

const bookCollections = ref<BookCollection[]>(props.collections);

function onSortChanged(collections: BookCollection[]): void {
  bookCollections.value = collections;
}

function deleteCollection(collection: BookCollection): void {
  bookCollections.value = bookCollections.value.filter((c) => c.id !== collection.id);
}

function save(): void {
  emit('saveClick', bookCollections.value);
}
</script>

<style lang="scss" scoped>
@forward './ManageBookCollectionDialog';
</style>
