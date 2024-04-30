<template>
  <div
    ref="elementRef"
    class="bookmark-item"
    :class="{ 'bookmark-item-focused': focused && readyToRunHighlight }"
    @animationend="emits('highlightAnimationEnd')"
  >
    <p class="bookmark-chapter" :class="{ 'bookmark-chapter-archived': bookmark.isArchived }">
      <span
        v-for="chapter in bookmark.chapter.parentChapters"
        :key="chapter.index"
        class="bookmark-parent-chapter-title"
      >
        {{ chapter.title }}
      </span>
      <span v-for="title in bookmark.chapter.titles" :key="title" class="bookmark-chapter-title">{{ title }}</span>
    </p>
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
        {{ bookmark.text }}
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
      <HighlightColorDropdown
        v-if="actions['change-color']"
        :color="bookmark.color"
        @update:color="(v) => emits('colorChanged', v)"
      />

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
import { ref, watch, onMounted, computed } from 'vue';

import { ArchiveIcon, ArchiveRefreshIcon, ShareVariantIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBookmark } from '@/dto/kobo-book';
import { BookmarkAction } from '@/enum/bookmark-action';
import { HighlightColor } from '@/enum/highlight-color';
import HighlightColorDropdown from '@/module/bookmarks/component/HighlightColorDropdown/HighlightColorDropdown.vue';

const props = defineProps<{ bookmark: KoboBookmark; focused?: boolean; enabledActions?: BookmarkAction[] }>();
const emits = defineEmits<{
  (e: 'colorChanged', value: HighlightColor): void;
  (e: 'createCardClick'): void;
  (e: 'archiveClick'): void;
  (e: 'cancelArchiveClick'): void;
  (e: 'highlightAnimationEnd'): void;
}>();
const elementRef = ref<HTMLElement>();
defineExpose({ elementRef });

const readyToRunHighlight = ref<boolean>(false);

const actions = computed<Partial<Record<BookmarkAction, boolean>>>(() => {
  const result: Partial<Record<BookmarkAction, boolean>> = {};
  for (const action of Object.values(BookmarkAction)) {
    result[action] = props.enabledActions?.includes(action);
  }
  return result;
});

onMounted(() => highlightSelfIfNeed());
watch(
  () => props.focused,
  () => highlightSelfIfNeed(),
);

function highlightSelfIfNeed(): void {
  const element = elementRef.value;
  if (!props.focused || !element) {
    readyToRunHighlight.value = false;
    return;
  }

  const intersectionObserver = new IntersectionObserver(onIntersection, { threshold: 0.5 });
  function onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        readyToRunHighlight.value = true;
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
