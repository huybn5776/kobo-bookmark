<template>
  <div class="book-header">
    <BookCoverView :book="book" @onCoverImageUpdated="(v) => emits('bookCoverImageUpdated', v)" />
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
        class="bookmark-expand-handle"
        :direction="expandedDirection"
        :disabled="disableBookmarkExpand"
        @update:direction="emits('update:expanded', $event === 'up')"
      />
      <div v-if="selectable" class="book-checkbox-container">
        <NCheckbox size="large" :checked="selected" @update:checked="(v) => emits('update:selected', v)" />
      </div>
      <div class="book-toolbar-container">
        <div class="book-toolbar">
          <IconButton
            v-if="!book.isArchived && actions.archive"
            i18nKey="common.archive"
            @click="emits('bookArchiveClick', book)"
          >
            <ArchiveIcon class="icon-24" />
          </IconButton>
          <IconButton
            v-if="actions['dropbox-share']"
            i18nKey="page.bookmarks.share_dropbox"
            @click="emits('shareClick', book)"
          >
            <DropboxShareIcon />
          </IconButton>
          <IconButton
            v-if="actions['export-text']"
            i18nKey="page.bookmarks.export_text"
            @click="emits('textExportClick', book)"
          >
            <TextIcon class="icon-24" />
          </IconButton>
          <IconButton
            v-if="actions['export-markdown']"
            i18nKey="page.bookmarks.export_markdown"
            @click="emits('markdownExportClick', book)"
          >
            <i18n-t keypath="page.bookmarks.export_markdown" />
            <MarkdownIcon class="icon-24" />
          </IconButton>
          <IconButton
            v-if="actions['export-notion']"
            i18nKey="page.bookmarks.export_notion"
            :loading="exportNotionLoading"
            @click="emits('notionExportClick', book)"
          >
            <NotionIcon class="icon-24" />
          </IconButton>

          <span v-if="book.isArchived" class="book-state-text">(<i18n-t keypath="common.archived" />)</span>
          <IconButton
            v-if="book.isArchived && actions.archive"
            i18nKey="common.cancel_archive"
            @click="emits('bookCancelArchive', book)"
          >
            <ArchiveRefreshIcon class="icon-24" />
          </IconButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NCheckbox } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import ChevronArrow from '@/component/ChevronArrow/ChevronArrow.vue';
import {
  NotionIcon,
  BookmarkMultipleIcon,
  DropboxShareIcon,
  BookClockIcon,
  MarkdownIcon,
  ArchiveIcon,
  ArchiveRefreshIcon,
  TextIcon,
} from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBook } from '@/dto/kobo-book';
import { BookAction } from '@/enum/book-action';
import BookCoverView from '@/module/bookmarks/component/BookCoverView/BookCoverView.vue';
import BookInfoItem from '@/module/bookmarks/component/BookInfoItem/BookInfoItem.vue';

const props = defineProps<{
  book: KoboBook;
  expanded?: boolean;
  selectable?: boolean;
  disableBookmarkExpand?: boolean;
  selected?: boolean;
  enabledActions?: BookAction[];
  exportNotionLoading?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:expanded', value: boolean): void;
  (e: 'update:selected', value: boolean): void;
  (e: 'textExportClick', value: KoboBook): void;
  (e: 'markdownExportClick', value: KoboBook): void;
  (e: 'notionExportClick', value: KoboBook): void;
  (e: 'bookCoverImageUpdated', value: string): void;
  (e: 'bookArchiveClick', value: KoboBook): void;
  (e: 'bookCancelArchive', value: KoboBook): void;
  (e: 'shareClick', value: KoboBook): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const expandedDirection = computed(() => (props.expanded ? 'up' : 'down'));
const actions = computed<Partial<Record<BookAction, boolean>>>(() => {
  const result: Partial<Record<BookAction, boolean>> = {};
  for (const action of Object.values(BookAction)) {
    result[action] = props.enabledActions?.includes(action);
  }
  return result;
});

function toggleExpanded(): void {
  if (props.disableBookmarkExpand) {
    return;
  }
  emits('update:expanded', !props.expanded);
}

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
</script>

<style lang="scss" scoped>
@import './BookItem';
</style>
