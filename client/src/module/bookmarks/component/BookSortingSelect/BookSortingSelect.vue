<template>
  <div class="book-sorting-select">
    <i18n-t keypath="page.bookmarks.sort_books_by" />
    <NSelect :value="bookSorting" :options="bookSortingOptions" clearable @updateValue="onBookSortingUpdate" />
    <i18n-t keypath="page.bookmarks.sort_bookmarks_by" />
    <NSelect
      :value="bookmarkSorting"
      :options="bookmarkSortingOptions"
      clearable
      @updateValue="onBookmarkSortingUpdate"
    />
  </div>
</template>

<script lang="ts" setup>
import { NSelect, SelectOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

defineProps<{ bookSorting: BookSortingKey | undefined; bookmarkSorting: BookmarkSortingKey | undefined }>();
const emits = defineEmits<{
  (e: 'update:bookSorting', value: BookSortingKey | undefined): void;
  (e: 'update:bookmarkSorting', value: BookmarkSortingKey | undefined): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const bookSortingOptions: SelectOption[] = [
  { label: t('page.bookmarks.last_bookmarked_time'), value: BookSortingKey.LastBookmark },
  { label: t('page.bookmarks.last_update'), value: BookSortingKey.LastUpdate },
  { label: t('page.bookmarks.last_added'), value: BookSortingKey.LastAdded },
  { label: t('page.bookmarks.book_name'), value: BookSortingKey.BookName },
  { label: t('page.bookmarks.author'), value: BookSortingKey.Author },
  { label: t('page.bookmarks.series'), value: BookSortingKey.Series },
];
const bookmarkSortingOptions: SelectOption[] = [
  { label: t('page.bookmarks.last_update'), value: BookmarkSortingKey.LastUpdate },
  { label: t('page.bookmarks.position'), value: BookmarkSortingKey.Position },
];

function onBookSortingUpdate(value: BookSortingKey): void {
  emits('update:bookSorting', value);
}

function onBookmarkSortingUpdate(value: BookmarkSortingKey): void {
  emits('update:bookmarkSorting', value);
}
</script>

<style lang="scss" scoped>
@import './BookSortingSelect';
</style>
