<template>
  <div ref="elementRef" class="book-bookmark">
    <div class="book-header">
      <BookCoverView :book="book" />
      <div class="book-section">
        <h2 class="book-title">
          <button class="book-title-button" @click="toggleExpanded">
            {{ book.info.title }}
          </button>
        </h2>
        <div class="book-info">
          <p class="book-info-text book-author">{{ book.info.author }}</p>
          <p class="book-info-text book-publisher">{{ book.info.publisher }}</p>
          <p class="book-info-text book-isbn">{{ book.info.isbn }}</p>
        </div>
        <div class="book-actions">
          <NButton class="bookmark-export-button" :loading="exportLoading" @click="emits('onExportClick', book)">
            Export to notion
          </NButton>
          <div class="book-toolbar">
            <NButton class="book-delete-button" secondary round @click="emits('onBookDelete', book)">Delete</NButton>
          </div>
        </div>
      </div>
      <ChevronArrow v-model:direction="expandedDirection" class="bookmark-expand-handle" />
    </div>

    <BookmarkList
      v-if="expandedDirection === 'up'"
      :bookmarks="book.bookmarks"
      class="book-bookmark-list"
      @onBookmarkDelete="emits('onBookmarkDelete', book, $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { NButton } from 'naive-ui';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import BookCoverView from '@/module/bookmarks/component/BookCoverView/BookCoverView.vue';
import BookmarkList from '@/module/bookmarks/component/BookmarkList/BookmarkList.vue';

const props = defineProps<{ book: KoboBook; defaultExpanded: boolean; exportLoading: boolean }>();
const emits = defineEmits<{
  (e: 'onExportClick', value: KoboBook): void;
  (e: 'onBookDelete', value: KoboBook): void;
  (e: 'onBookmarkDelete', book: KoboBook, bookmark: KoboBookmark): void;
}>();

const elementRef = ref<HTMLElement>();

const expandedDirection = ref<'up' | 'down'>(props.defaultExpanded ? 'up' : 'down');
defineExpose({ elementRef });

function toggleExpanded(): void {
  expandedDirection.value = expandedDirection.value === 'up' ? 'down' : 'up';
}
</script>

<style lang="scss" scoped>
@import './BookBookmark';
</style>
