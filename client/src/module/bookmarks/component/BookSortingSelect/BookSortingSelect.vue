<template>
  <div class="book-sorting-select">
    <span>Sort books by: </span>
    <NSelect :value="bookSorting" :options="bookSortingOptions" clearable @updateValue="onBookSortingUpdate" />
    <span>Sort bookmarks by: </span>
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

import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

defineProps<{ bookSorting: BookSortingKey | undefined; bookmarkSorting: BookmarkSortingKey | undefined }>();
const emits = defineEmits<{
  (e: 'update:bookSorting', value: BookSortingKey | undefined): void;
  (e: 'update:bookmarkSorting', value: BookmarkSortingKey | undefined): void;
}>();

const bookSortingOptions: SelectOption[] = [
  { label: 'Last bookmarked time', value: BookSortingKey.LastBookmark },
  { label: 'Last update', value: BookSortingKey.LastUpdate },
  { label: 'Last added', value: BookSortingKey.LastAdded },
  { label: 'Book name', value: BookSortingKey.BookName },
  { label: 'Author', value: BookSortingKey.Author },
  { label: 'Series', value: BookSortingKey.Series },
];
const bookmarkSortingOptions: SelectOption[] = [
  { label: 'Last update', value: BookmarkSortingKey.LastUpdate },
  { label: 'Position', value: BookmarkSortingKey.Position },
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
