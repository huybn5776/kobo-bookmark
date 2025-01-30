<template>
  <NPopselect multiple trigger="click" :options="options" :value="selectValue" @update:value="onSelect">
    <NButton secondary round class="bookmark-sort-button" :disabled="disabled">
      <Icon name="sort" class="icon-24" />
      <i18n-t keypath="common.sorting" />
    </NButton>
  </NPopselect>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NButton, NPopselect, SelectOption } from 'naive-ui';
import { SelectGroupOption } from 'naive-ui/es/select/src/interface';
import { useI18n } from 'vue-i18n';

import Icon from '@/component/icon/Icon.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookSortingKey } from '@/enum/book-sorting-key';
import { BookSortingPriorityKey } from '@/enum/book-sorting-priority-key';
import { BookmarkSortingKey } from '@/enum/bookmark-sorting-key';

defineProps<{ disabled?: boolean }>();
const bookSortingPriorityModel = defineModel<BookSortingPriorityKey>('bookSortingPriority');
const bookSortingModel = defineModel<BookSortingKey>('bookSorting');
const bookmarkSortingModel = defineModel<BookmarkSortingKey>('bookmarkSorting');

const selectValue = computed(() => [
  `book-priority-${bookSortingPriorityModel.value}`,
  `book-${bookSortingModel.value}`,
  `bookmark-${bookmarkSortingModel.value}`,
]);

const { t } = useI18n<[I18NMessageSchema]>();

const options = computed<SelectGroupOption[]>(() => [
  {
    key: 'book-priority',
    type: 'group',
    label: t('page.bookmarks.book_priority'),
    children: [
      {
        parent: 'book-priority',
        label: t('page.bookmarks.book_priority_none'),
        value: `book-priority-${BookSortingPriorityKey.None}`,
        sort: BookSortingPriorityKey.None,
      },
      {
        parent: 'book-priority',
        label: t('page.bookmarks.book_priority_started'),
        value: `book-priority-${BookSortingPriorityKey.Stared}`,
        sort: BookSortingPriorityKey.Stared,
      },
    ],
  },
  {
    key: 'book',
    type: 'group',
    label: t('page.bookmarks.sort_books_by'),
    children: [
      {
        parent: 'book',
        label: t('page.bookmarks.book_sorting_none'),
        value: `book-${BookSortingKey.None}`,
        sort: BookSortingKey.None,
      },
      {
        parent: 'book',
        label: t('page.bookmarks.last_bookmarked_time'),
        value: `book-${BookSortingKey.LastBookmark}`,
        sort: BookSortingKey.LastBookmark,
      },
      {
        parent: 'book',
        label: t('page.bookmarks.last_update'),
        value: `book-${BookSortingKey.LastUpdate}`,
        sort: BookSortingKey.LastUpdate,
      },
      {
        parent: 'book',
        label: t('page.bookmarks.last_added'),
        value: `book-${BookSortingKey.LastAdded}`,
        sort: BookSortingKey.LastAdded,
      },
      {
        parent: 'book',
        label: t('page.bookmarks.book_name'),
        value: `book-${BookSortingKey.BookName}`,
        sort: BookSortingKey.BookName,
      },
      {
        parent: 'book',
        label: t('page.bookmarks.author'),
        value: `book-${BookSortingKey.Author}`,
        sort: BookSortingKey.Author,
      },
      {
        parent: 'book',
        label: t('page.bookmarks.series'),
        value: `book-${BookSortingKey.Series}`,
        sort: BookSortingKey.Series,
      },
    ],
  },
  {
    key: 'bookmark',
    type: 'group',
    label: t('page.bookmarks.sort_bookmarks_by'),
    children: [
      {
        parent: 'bookmark',
        label: t('page.bookmarks.last_update'),
        value: `bookmark-${BookmarkSortingKey.LastUpdate}`,
        sort: BookmarkSortingKey.LastUpdate,
      },
      {
        parent: 'bookmark',
        label: t('page.bookmarks.position'),
        value: `bookmark-${BookmarkSortingKey.Position}`,
        sort: BookmarkSortingKey.Position,
      },
    ],
  },
]);
function onSelect(
  _: string,
  selectedOptions: (SelectOption & {
    parent: 'book-priority' | 'book' | 'bookmark';
    sort: BookSortingPriorityKey | BookSortingKey | BookmarkSortingKey;
  })[],
): void {
  for (const option of selectedOptions) {
    switch (option.parent) {
      case 'book-priority':
        bookSortingPriorityModel.value = option.sort as BookSortingPriorityKey;
        break;
      case 'book':
        bookSortingModel.value = option.sort as BookSortingKey;
        break;
      case 'bookmark':
        bookmarkSortingModel.value = option.sort as BookmarkSortingKey;
        break;
      default:
        break;
    }
  }
}
</script>

<style lang="scss" scoped>
@forward './BookmarkSortingDropdown';
</style>
