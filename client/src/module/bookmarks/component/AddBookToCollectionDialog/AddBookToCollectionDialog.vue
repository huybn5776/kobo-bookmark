<template>
  <div class="add-book-to-collection-dialog">
    <div class="add-book-to-collection-dialog-content">
      <NVirtualList :itemSize="40" :items="bookCollections" class="book-collection-list">
        <!--suppress VueUnrecognizedSlot -->
        <template #default="{ item }">
          <NTooltip v-if="disabledCollections[item.id]" trigger="hover" :delay="500">
            <!--suppress VueUnrecognizedSlot -->
            <template #trigger>
              <div class="book-collection disabled-book-collection">
                <span>{{ item.name }}</span>
              </div>
            </template>
            <i18n-t keypath="page.bookmarks.book_collection_already_contained_books" />
          </NTooltip>
          <div v-else class="book-collection" @click="onCollectionClick(item)">
            <span>{{ item.name }}</span>
          </div>
        </template>
      </NVirtualList>
      <div class="book-collection" @click="emit('createCollectionClick')">
        <PlusIcon class="icon-24" />
        <i18n-t keypath="page.bookmarks.create_collection" />
      </div>
    </div>

    <div class="add-book-to-collection-dialog-actions">
      <NButton size="small" @click="emit('cancelClick')">
        <i18n-t keypath="common.cancel" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NButton, NVirtualList, NTooltip } from 'naive-ui';

import { PlusIcon } from '@/component/icon';
import { BookCollection } from '@/dto/book-collection';

const props = defineProps<{ bookIds: string[]; bookCollections: BookCollection[] }>();
const emit = defineEmits<{
  (e: 'collectionClick', collection: BookCollection): void;
  (e: 'createCollectionClick'): void;
  (e: 'cancelClick'): void;
}>();

const disabledCollections = computed(() => {
  const result: Record<string, boolean> = {};
  for (const collection of props.bookCollections) {
    result[collection.id] = props.bookIds.every((bookId) => collection.bookIds.includes(bookId));
  }
  return result;
});

function onCollectionClick(collection: BookCollection): void {
  emit('collectionClick', collection);
}
</script>

<style lang="scss" scoped>
@import './AddBookToCollectionDialog';
</style>
