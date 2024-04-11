<template>
  <div class="bookmark-item">
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
      <template v-if="!bookmark.isArchived && !disabled">
        <IconButton i18nKey="common.archive" @click="emits('onArchiveClick')">
          <ArchiveIcon class="bookmark-action-icon" />
        </IconButton>
        <HighlightColorDropdown :color="bookmark.color" @update:color="(v) => emits('onColorChanged', v)" />
      </template>
      <template v-if="bookmark.isArchived && !disabled">
        <span class="bookmark-state-text">(<i18n-t keypath="common.archived" />)</span>
        <IconButton i18nKey="common.cancel_archive" @click="emits('onCancelArchiveClick')">
          <ArchiveRefreshIcon class="bookmark-action-icon" />
        </IconButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArchiveIcon, ArchiveRefreshIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import HighlightColorDropdown from '@/module/bookmarks/component/HighlightColorDropdown/HighlightColorDropdown.vue';

defineProps<{ bookmark: KoboBookmark; disabled?: boolean }>();
const emits = defineEmits<{
  (e: 'onColorChanged', value: HighlightColor): void;
  (e: 'onArchiveClick'): void;
  (e: 'onCancelArchiveClick'): void;
}>();
</script>

<style lang="scss" scoped>
@import './BookmarkItem';
</style>
