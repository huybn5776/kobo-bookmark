<template>
  <div class="book-information-dialog">
    <div class="book-information-dialog-content">
      <div class="book-information-title">
        <span>{{ props.book.info.title }}</span>
      </div>

      <template v-if="book.info.originalTitle">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.original_title" />
        </label>
        <span>{{ book.info.originalTitle }}</span>
      </template>
      <template v-if="book.info.subtitle">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.subtitle" />
        </label>
        <span>{{ book.info.subtitle }}</span>
      </template>
      <template v-if="book.info.author">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.author" />
        </label>
        <span>{{ book.info.author }}</span>
      </template>
      <template v-if="book.info.series">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.series" />
        </label>
        <span>{{ book.info.series }}</span>
      </template>
      <template v-if="book.info.publisher">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.publisher" />
        </label>
        <span>{{ book.info.publisher }}</span>
      </template>
      <template v-if="publicationDate">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.publication_date" />
        </label>
        <span>{{ publicationDate }}</span>
      </template>
      <template v-if="book.info.isbn">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.isbn" />
        </label>
        <span>{{ book.info.isbn }}</span>
      </template>

      <template v-if="lastReadAt">
        <label class="book-info-label">
          <i18n-t keypath="page.bookmarks.book_info.last_read_at" />
        </label>
        <span>{{ lastReadAt }}</span>
      </template>

      <label class="book-info-label">
        <i18n-t keypath="page.bookmarks.book_info.first_bookmark_at" />
      </label>
      <span>{{ firstBookmarkAt }}</span>
      <label class="book-info-label">
        <i18n-t keypath="page.bookmarks.book_info.last_bookmark_at" />
      </label>
      <span>{{ lastBookmarkAt }}</span>
    </div>

    <div class="book-information-dialog-actions">
      <NButton size="small" @click="emits('closeClick')">
        <i18n-t keypath="common.close" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NButton } from 'naive-ui';

import { KoboBook } from '@/dto/kobo-book';

const props = defineProps<{ book: KoboBook }>();
const emits = defineEmits<{
  (e: 'titleUpdated', title: string): void;
  (e: 'closeClick'): void;
}>();

const lastReadAt = computed(() => props.book.info.lastReadAt?.toLocaleString());
const publicationDate = computed(() => {
  const date = props.book.info?.publicationDate;
  if (!date) {
    return undefined;
  }
  const datePartString = date.toISOString().split('T')[0];
  return new Date(datePartString).toLocaleDateString();
});
const firstBookmarkAt = computed(() =>
  new Date(Math.min(...props.book.bookmarks.map((b) => b.createdAt.getTime()))).toLocaleString(),
);
const lastBookmarkAt = computed(() =>
  new Date(Math.max(...props.book.bookmarks.map((b) => b.updatedAt.getTime()))).toLocaleString(),
);
</script>

<style lang="scss" scoped>
@import './BookInformationDialog';
</style>
