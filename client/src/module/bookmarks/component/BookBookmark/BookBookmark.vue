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

          <div class="book-info-bar">
            <BookInfoItem i18nKey="page.bookmarks.bookmarks_count">
              <BookmarkMultipleIcon class="book-info-item-icon" />
              <span>{{ book.bookmarks.length }}</span>
            </BookInfoItem>
            <BookInfoItem v-if="timeSpanReadingHours" i18nKey="page.bookmarks.read_time">
              <BookClockIcon class="book-info-item-icon" />
              <span>{{ timeSpanReadingHours }}</span>
            </BookInfoItem>
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
            <template v-if="!book.isArchived">
              <IconButton v-if="!readonly" i18nKey="common.archive" @click="emits('onBookArchiveClick', book)">
                <ArchiveIcon class="icon-24" />
              </IconButton>
              <IconButton v-if="!readonly" i18nKey="page.bookmarks.share_dropbox" @click="emits('onShareClick', book)">
                <DropboxShareIcon />
              </IconButton>
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
            </template>
            <template v-if="book.isArchived">
              <span class="book-state-text">(<i18n-t keypath="common.archived" />)</span>
              <IconButton v-if="!readonly" i18nKey="common.cancel_archive" @click="emits('onBookCancelArchive', book)">
                <ArchiveRefreshIcon class="icon-24" />
              </IconButton>
            </template>
          </div>
        </div>
      </div>
    </div>

    <BookmarkList
      v-if="expandedDirection === 'up' && !disableBookmarkExpand"
      :bookmarks="book.bookmarks"
      :disabled="!!book.isArchived"
      :readonly="readonly"
      class="book-bookmark-list"
      @onBookmarkColorChanged="(bookmark, color) => emits('onBookmarkColorChanged', book, bookmark, color)"
      @onBookmarkArchive="emits('onBookmarkArchiveClick', book, $event)"
      @onBookmarkCancelArchive="emits('onBookmarkCancelArchiveClick', book, $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NCheckbox } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import {
  BookmarkMultipleIcon,
  BookClockIcon,
  ArchiveIcon,
  DropboxShareIcon,
  ArchiveRefreshIcon,
  MarkdownIcon,
  NotionIcon,
  TextIcon,
} from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook, KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import BookCoverView from '@/module/bookmarks/component/BookCoverView/BookCoverView.vue';
import BookInfoItem from '@/module/bookmarks/component/BookInfoItem/BookInfoItem.vue';
import BookmarkList from '@/module/bookmarks/component/BookmarkList/BookmarkList.vue';

const props = defineProps<{
  book: KoboBook;
  defaultExpanded: boolean;
  selected: boolean;
  readonly?: boolean;
  exportNotionLoading?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:selected', value: boolean): void;
  (e: 'onTextExportClick', value: KoboBook): void;
  (e: 'onMarkdownExportClick', value: KoboBook): void;
  (e: 'onNotionExportClick', value: KoboBook): void;
  (e: 'onBookCoverImageUpdated', value: string): void;
  (e: 'onBookArchiveClick', value: KoboBook): void;
  (e: 'onBookCancelArchive', value: KoboBook): void;
  (e: 'onShareClick', value: KoboBook): void;
  (e: 'onBookmarkColorChanged', book: KoboBook, bookmark: KoboBookmark, color: HighlightColor): void;
  (e: 'onBookmarkArchiveClick', book: KoboBook, bookmark: KoboBookmark): void;
  (e: 'onBookmarkCancelArchiveClick', book: KoboBook, bookmark: KoboBookmark): void;
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
