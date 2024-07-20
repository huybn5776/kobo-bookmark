<template>
  <div class="bookmark-filter-dropdown">
    <NPopover v-model:show="showPopover" trigger="click" raw placement="bottom" :showArrow="false">
      <template #trigger>
        <NButton
          secondary
          round
          class="bookmark-filter-button"
          :disabled="disabled"
          :class="{ 'bookmark-filter-button-active': collectionModel || tagModel || colorsModel.length }"
        >
          <FilterIcon class="icon-24" />
          <i18n-t keypath="common.filter" />
        </NButton>
      </template>
      <div class="bookmark-filter-groups">
        <BookmarkFilterGroup
          v-slot:default="{ item }"
          v-model:value="collectionModel"
          single
          searchable
          searchField="name"
          titleKey="page.bookmarks.collection"
          keyField="id"
          :items="bookCollections?.collections || []"
          :expanded="!!expandedFilters?.[BookmarkFilterKey.Collection]"
          @update:expanded="setExpandedFilter(BookmarkFilterKey.Collection, $event)"
          @escape="showPopover = false"
        >
          <IconLabel
            clickable
            :label="`${item.name} (${item.bookIds.length})`"
            @iconClick="onCollectionEditClick(item)"
          >
            <PencilIcon class="icon-20" />
          </IconLabel>
        </BookmarkFilterGroup>
        <BookmarkFilterGroup
          v-slot:default="{ item }"
          v-model:value="tagModel"
          single
          searchable
          searchField="title"
          titleKey="common.tag"
          keyField="title"
          :items="allAvailableTags"
          :expanded="!!expandedFilters?.[BookmarkFilterKey.Tag]"
          :emptyMessageKey="emptyTagMessageKey"
          @update:expanded="setExpandedFilter(BookmarkFilterKey.Tag, $event)"
          @escape="showPopover = false"
        >
          <IconLabel :label="`${item.title} (${item.count})`">
            <TagIcon class="icon-16" />
          </IconLabel>
        </BookmarkFilterGroup>
        <BookmarkFilterGroup
          v-slot:default="{ item }"
          v-model:value="colorsModel"
          titleKey="page.bookmarks.highlight_color"
          keyField="color"
          :items="colorItems"
          :expanded="!!expandedFilters?.[BookmarkFilterKey.HighlightColor]"
          @update:expanded="setExpandedFilter(BookmarkFilterKey.HighlightColor, $event)"
        >
          <ColorIconLabel :color="item.color" :label="t(`common.color.${item.color}`)" />
        </BookmarkFilterGroup>
      </div>
    </NPopover>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NButton, NPopover } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { PencilIcon, TagIcon, FilterIcon } from '@/component/icon';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { BookCollection } from '@/dto/book-collection';
import { KoboBook } from '@/dto/kobo-book';
import { BookmarkFilterKey } from '@/enum/bookmark-filter-key';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import BookmarkFilterGroup from '@/module/bookmarks/component/BookmarkFilterGroup/BookmarkFilterGroup.vue';
import ColorIconLabel from '@/module/bookmarks/component/ColorIconLabel/ColorIconLabel.vue';
import IconLabel from '@/module/bookmarks/component/IconLabel/IconLabel.vue';
import { summarizeTagsOfBooks } from '@/services/tag/tag.service';
import { provideActiveCollection, provideExpandedBookId } from '@/symbols';
import { injectStrict } from '@/util/vue-utils';

const props = defineProps<{ books: KoboBook[]; disabled?: boolean }>();
const emit = defineEmits<{
  (e: 'createCollectionClick'): void;
  (e: 'editCollectionClick', collectionId: string): void;
}>();
const collectionModel = defineModel<string>('collection');
const tagModel = defineModel<string>('tag');
const colorsModel = defineModel<HighlightColor[]>('colors', { default: [] });

const { t } = useI18n<[I18NMessageSchema]>();

const colorItems = Object.values(HighlightColor).map((color) => ({ color }));

const showPopover = ref<boolean>(false);
const expandedFilters = useSyncSetting(SettingKey.ExpandedBookFilters);
const bookCollections = useSyncSetting(SettingKey.BookCollection);

const expandedBookId = injectStrict(provideExpandedBookId);
const bookCollectionFilter = injectStrict(provideActiveCollection);

const allAvailableTags = computed(() => {
  let booksToSummarize = props.books;
  if (booksToSummarize.length && expandedBookId.value) {
    const targetBook = booksToSummarize.find((book) => book.id === expandedBookId.value);
    booksToSummarize = targetBook ? [targetBook] : [];
  }
  if (booksToSummarize.length && bookCollectionFilter.value) {
    const bookIds = bookCollectionFilter.value?.bookIds || [];
    booksToSummarize = booksToSummarize.filter((book) => bookIds.includes(book.id));
  }
  return summarizeTagsOfBooks(booksToSummarize);
});
const emptyTagMessageKey = computed(() => {
  if (expandedBookId.value) {
    return 'page.bookmarks.no_tags_under_book';
  }
  if (bookCollectionFilter.value) {
    return 'page.bookmarks.no_tags_under_book_collection';
  }
  return 'common.empty';
});

function setExpandedFilter(key: BookmarkFilterKey, expanded: boolean): void {
  if (expanded) {
    expandedFilters.value = { ...(expandedFilters.value || {}), [key]: true };
  } else if (expandedFilters.value?.[key]) {
    delete expandedFilters.value[key];
  }
}

function onCollectionEditClick(item: BookCollection): void {
  emit('editCollectionClick', item.id);
  showPopover.value = false;
}
</script>

<style lang="scss" scoped>
@import './BookmarkFilterDropdown';
</style>
