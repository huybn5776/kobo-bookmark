<template>
  <div
    ref="elementRef"
    class="bookmark-item"
    :class="{
      'bookmark-item-focused': highlightItem,
      'bookmark-item-no-chapter': !bookmark.chapter.relatedChapterIndexes.length,
    }"
    @animationend="highlightItem = false"
  >
    <BookmarkChapterView
      v-if="bookmark.chapter.relatedChapterIndexes.length"
      :chapterIndexMap="chapterIndexMap"
      :chapter="bookmark.chapter"
      :archived="bookmark.isArchived"
    />
    <p class="bookmark-text" :class="{ 'bookmark-text-archived': bookmark.isArchived }">
      <span
        :class="{
          'bookmark-text-yellow': bookmark.color === HighlightColor.Yellow,
          'bookmark-text-red': bookmark.color === HighlightColor.Red,
          'bookmark-text-green': bookmark.color === HighlightColor.Green,
          'bookmark-text-blue': bookmark.color === HighlightColor.Blue,
          'bookmark-text-pink': bookmark.color === HighlightColor.Pink,
          'bookmark-text-purple': bookmark.color === HighlightColor.Purple,
        }"
      >
        <HighlightText :text="bookmark.text" :search="search" />
      </span>
    </p>
    <blockquote v-if="bookmark.annotation" class="bookmark-annotation">
      {{ bookmark.annotation }}
    </blockquote>

    <div class="bookmark-toolbar">
      <IconButton
        v-if="!bookmark.isArchived && actions.archive"
        i18nKey="common.archive"
        @click="emits('archiveClick')"
      >
        <ArchiveIcon class="bookmark-action-icon" />
      </IconButton>
      <IconButton
        v-if="actions['create-card']"
        i18nKey="page.bookmarks.create_bookmark_card"
        @click="emits('createCardClick')"
      >
        <ShareVariantIcon class="bookmark-action-icon" />
      </IconButton>
      <IconButton v-if="actions['edit']" i18nKey="common.edit" @click="emits('editClick')">
        <PencilIcon class="bookmark-action-icon" />
      </IconButton>

      <template v-if="bookmark.isArchived">
        <span class="bookmark-state-text">(<i18n-t keypath="common.archived" />)</span>
        <IconButton v-if="actions.archive" i18nKey="common.cancel_archive" @click="emits('cancelArchiveClick')">
          <ArchiveRefreshIcon class="bookmark-action-icon" />
        </IconButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import HighlightText from '@/component/HighlightText/HighlightText.vue';
import { ArchiveIcon, ArchiveRefreshIcon, ShareVariantIcon, PencilIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBookmark, KoboBookChapter } from '@/dto/kobo-book';
import { BookmarkAction } from '@/enum/bookmark-action';
import { HighlightColor } from '@/enum/highlight-color';
import BookmarkChapterView from '@/module/bookmarks/component/BookmarkChapterView/BookmarkChapterView.vue';

const props = defineProps<{
  chapterIndexMap: Record<number, KoboBookChapter>;
  bookmark: KoboBookmark;
  search?: string;
  enabledActions?: BookmarkAction[];
}>();
const emits = defineEmits<{
  (e: 'editClick'): void;
  (e: 'createCardClick'): void;
  (e: 'archiveClick'): void;
  (e: 'cancelArchiveClick'): void;
  (e: 'highlightAnimationEnd'): void;
}>();
const elementRef = ref<HTMLElement>();
defineExpose({ elementRef, runHighlightAnimationWhenVisible });

const highlightItem = ref<boolean>(false);

const actions = computed<Partial<Record<BookmarkAction, boolean>>>(() => {
  const result: Partial<Record<BookmarkAction, boolean>> = {};
  for (const action of Object.values(BookmarkAction)) {
    result[action] = props.enabledActions?.includes(action);
  }
  return result;
});

function runHighlightAnimationWhenVisible(): void {
  const element = elementRef.value;
  if (!element) {
    highlightItem.value = false;
    return;
  }

  const intersectionObserver = new IntersectionObserver(onIntersection, { threshold: 0.5 });
  function onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        highlightItem.value = true;
        intersectionObserver.disconnect();
      }
    });
  }
  intersectionObserver.observe(element);
}
</script>

<style lang="scss" scoped>
@import './BookmarkItem';
</style>
