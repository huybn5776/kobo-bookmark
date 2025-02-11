<template>
  <div class="book-header">
    <div class="book-cover-container">
      <BookCoverView
        :book="book"
        :countTag="newBookmarksCount"
        @starClick="emit('bookStarClick', book)"
        @coverImageUpdated="(v) => emit('bookCoverImageUpdated', v)"
      />
      <CountTag v-if="newBookmarksCount" keyPath="page.bookmarks.new_highlight_count" :count="newBookmarksCount" />
    </div>
    <div class="book-section">
      <h2 class="book-title" :class="{ 'book-title-disabled': disableBookmarkExpand }">
        <button v-if="expanded || !expandWithLink" class="book-title-button" @click="toggleExpanded">
          {{ book.info.title }}
        </button>
        <router-link
          v-if="!expanded && expandWithLink"
          class="book-title-button"
          :to="{ params: { bookId: encodeBookId(book.id) } }"
        >
          {{ book.info.title }}
        </router-link>
      </h2>
      <div class="book-info">
        <p v-if="book.info.author" class="book-info-text book-author">{{ book.info.author }}</p>
        <p v-if="book.info.publisher" class="book-info-text book-publisher">{{ book.info.publisher }}</p>
        <p v-if="book.info.isbn" class="book-info-text book-isbn">{{ book.info.isbn }}</p>

        <div class="book-info-bar">
          <BookInfoItem i18nKey="page.bookmarks.bookmarks_count">
            <Icon name="bookmark-multiple" class="book-info-item-icon" />
            <span>{{ book.bookmarks.length }}</span>
          </BookInfoItem>
          <BookInfoItem v-if="timeSpanReadingHours" i18nKey="page.bookmarks.read_time">
            <Icon name="book-clock-outline" class="book-info-item-icon" />
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
        @update:direction="emit('update:expanded', $event === 'up')"
      />
      <div v-if="selectable" class="book-checkbox-container">
        <NCheckbox
          size="large"
          aria-label="check"
          :checked="selected"
          @update:checked="(v) => emit('update:selected', v)"
        />
      </div>
      <div class="book-toolbar-container">
        <div class="book-toolbar">
          <IconButton
            v-if="!book.isArchived && actions.archive"
            i18nKey="common.archive"
            class="book-toolbar-secondary-button"
            @click="emit('bookArchiveClick', book)"
          >
            <Icon name="archive" class="icon-24" />
          </IconButton>
          <IconButton
            v-if="actions['dropbox-share']"
            i18nKey="page.bookmarks.share_dropbox"
            class="book-toolbar-secondary-button"
            @click="emit('shareClick', book)"
          >
            <DropboxShareIcon />
          </IconButton>
          <IconButton
            v-if="actions['export-text']"
            i18nKey="page.bookmarks.export_text"
            class="book-toolbar-secondary-button"
            @click="emit('textExportClick', book)"
          >
            <Icon name="text" class="icon-24" />
          </IconButton>
          <IconButton
            v-if="actions['export-markdown']"
            i18nKey="page.bookmarks.export_markdown"
            class="book-toolbar-secondary-button"
            @click="emit('markdownExportClick', book)"
          >
            <i18n-t keypath="page.bookmarks.export_markdown" />
            <Icon name="markdown" class="icon-24" />
          </IconButton>
          <IconButton
            v-if="actions['export-notion']"
            i18nKey="page.bookmarks.export_notion"
            class="book-toolbar-secondary-button"
            :loading="exportNotionLoading"
            @click="emit('notionExportClick', book)"
          >
            <Icon name="notion" class="icon-24" />
          </IconButton>

          <span v-if="book.isArchived" class="book-state-text">(<i18n-t keypath="common.archived" />)</span>
          <IconButton
            v-if="book.isArchived && actions.archive"
            i18nKey="common.cancel_archive"
            class="book-toolbar-secondary-button"
            @click="emit('bookCancelArchive', book)"
          >
            <Icon name="archive-refresh" class="icon-24" />
          </IconButton>
          <IconButton i18nKey="page.bookmarks.book_information" @click="emit('bookInformationClick', book)">
            <Icon name="information-outline" class="icon-24" />
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
import DropboxShareIcon from '@/component/icon/DropboxShareIcon/DropboxShareIcon.vue';
import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { newBookmarkTime } from '@/const/consts';
import { KoboBook } from '@/dto/kobo-book';
import { BookAction } from '@/enum/book-action';
import { SettingKey } from '@/enum/setting-key';
import BookCoverView from '@/module/bookmarks/component/BookCoverView/BookCoverView.vue';
import BookInfoItem from '@/module/bookmarks/component/BookInfoItem/BookInfoItem.vue';
import CountTag from '@/module/bookmarks/component/CountTag/CountTag.vue';
import { encodeBookId } from '@/util/book-id-encode';

const props = defineProps<{
  book: KoboBook;
  expanded?: boolean;
  expandWithLink?: boolean;
  selectable?: boolean;
  disableBookmarkExpand?: boolean;
  selected?: boolean;
  enabledActions?: BookAction[];
  exportNotionLoading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:expanded', value: boolean): void;
  (e: 'update:selected', value: boolean): void;
  (e: 'textExportClick', value: KoboBook): void;
  (e: 'markdownExportClick', value: KoboBook): void;
  (e: 'notionExportClick', value: KoboBook): void;
  (e: 'bookStarClick', value: KoboBook): void;
  (e: 'bookCoverImageUpdated', value: string): void;
  (e: 'bookArchiveClick', value: KoboBook): void;
  (e: 'bookCancelArchive', value: KoboBook): void;
  (e: 'shareClick', value: KoboBook): void;
  (e: 'bookInformationClick', value: KoboBook): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const lastImportState = useSyncSetting(SettingKey.LastImportState);

const newBookmarksCount = computed(() => {
  const targetTime = (lastImportState.value?.importedAt ?? Date.now()) - newBookmarkTime;
  return props.book.bookmarks.filter((bookmark) => bookmark.importedAt && bookmark.importedAt.getTime() > targetTime)
    .length;
});
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
  emit('update:expanded', !props.expanded);
}

const timeSpanReadingHours = computed(() => {
  if (!props.book.info.timeSpentReading) {
    return null;
  }
  const seconds = props.book.info.timeSpentReading ?? 0;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  if (hours >= 1) {
    return t('common.number_hour', [hours.toFixed(1)], hours);
  }
  return t('common.number_minute', [minutes.toFixed(0)], minutes);
});
</script>

<style lang="scss" scoped>
@forward './BookItem';
</style>
