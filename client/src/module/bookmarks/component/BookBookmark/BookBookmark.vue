<template>
  <div ref="elementRef" class="book-bookmark" :class="{ 'book-selected': selected }">
    <div class="book-header">
      <BookCoverView :book="book" @onCoverImageUpdated="(v) => emits('onBookCoverImageUpdated', v)" />
      <div class="book-section">
        <h2 class="book-title">
          <button
            class="book-title-button"
            :class="{ 'book-title-button-disabled': disableBookmarkExpand }"
            @click="toggleExpanded"
          >
            {{ book.info.title }}
          </button>
        </h2>
        <div class="book-info">
          <p v-if="book.info.author" class="book-info-text book-author">{{ book.info.author }}</p>
          <p v-if="book.info.publisher" class="book-info-text book-publisher">{{ book.info.publisher }}</p>
          <p v-if="book.info.isbn" class="book-info-text book-isbn">{{ book.info.isbn }}</p>
          <div v-if="timeSpanReadingHours" class="book-time-span-reading">
            <NPopover trigger="hover" :delay="500">
              <template #trigger>
                <BookClockIcon class="book-clock-icon" />
              </template>
              <i18n-t keypath="page.bookmarks.read_time" />
            </NPopover>
            <span>{{ timeSpanReadingHours }}</span>
          </div>
        </div>
      </div>
      <div class="book-actions">
        <ChevronArrow
          v-model:direction="expandedDirection"
          :disabled="disableBookmarkExpand"
          class="bookmark-expand-handle"
        />
        <div class="book-checkbox-container">
          <NCheckbox size="large" :checked="selected" @update:checked="(v) => emits('update:selected', v)" />
        </div>
        <div class="book-toolbar-container">
          <div class="book-toolbar">
            <IconButton i18nKey="page.bookmarks.export_text" @click="emits('onTextExportClick', book)">
              <TextIcon class="icon-24" />
            </IconButton>
            <IconButton i18nKey="page.bookmarks.export_markdown" @click="emits('onMarkdownExportClick', book)">
              <i18n-t keypath="page.bookmarks.export_markdown" />
              <MarkdownIcon class="icon-24" />
            </IconButton>
            <IconButton
              i18nKey="page.bookmarks.export_notion"
              :loading="exportNotionLoading"
              @click="emits('onNotionExportClick', book)"
            >
              <NotionIcon class="icon-24" />
            </IconButton>
            <IconButton i18nKey="common.delete" @click="emits('onBookDelete', book)">
              <DeleteIcon class="icon-24" />
            </IconButton>
          </div>
        </div>
      </div>
    </div>

    <BookmarkList
      v-if="expandedDirection === 'up' && !disableBookmarkExpand"
      :bookmarks="book.bookmarks"
      class="book-bookmark-list"
      @onBookmarkColorChanged="(bookmark, color) => emits('onBookmarkColorChanged', book, bookmark, color)"
      @onBookmarkDelete="emits('onBookmarkDelete', book, $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NCheckbox, NPopover } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import { BookClockIcon, DeleteIcon, MarkdownIcon, NotionIcon, TextIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import BookCoverView from '@/module/bookmarks/component/BookCoverView/BookCoverView.vue';
import BookmarkList from '@/module/bookmarks/component/BookmarkList/BookmarkList.vue';

const props = defineProps<{
  book: KoboBook;
  defaultExpanded: boolean;
  selected: boolean;
  exportNotionLoading?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:selected', value: boolean): void;
  (e: 'onTextExportClick', value: KoboBook): void;
  (e: 'onMarkdownExportClick', value: KoboBook): void;
  (e: 'onNotionExportClick', value: KoboBook): void;
  (e: 'onBookCoverImageUpdated', value: string): void;
  (e: 'onBookDelete', value: KoboBook): void;
  (e: 'onBookmarkColorChanged', book: KoboBook, bookmark: KoboBookmark, color: HighlightColor): void;
  (e: 'onBookmarkDelete', book: KoboBook, bookmark: KoboBookmark): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();
const elementRef = ref<HTMLElement>();

const expandedDirection = ref<'up' | 'down'>(props.defaultExpanded ? 'up' : 'down');
defineExpose({ elementRef });

const timeSpanReadingHours = computed(() => {
  if (!props.book?.info.timeSpentReading) {
    return null;
  }
  const seconds = props.book?.info.timeSpentReading ?? 0;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  if (hours >= 1) {
    return t('common.number_hour', [hours.toFixed(1)], hours);
  }
  return t('common.number_minute', [minutes.toFixed(0)], minutes);
});
const disableBookmarkExpand = computed(() => !props.book.bookmarks.length);

function toggleExpanded(): void {
  if (disableBookmarkExpand.value) {
    return;
  }
  expandedDirection.value = expandedDirection.value === 'up' ? 'down' : 'up';
}
</script>

<style lang="scss" scoped>
@import './BookBookmark';
</style>
