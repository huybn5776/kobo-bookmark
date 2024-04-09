<template>
  <div class="bookmark-item">
    <p class="bookmark-chapter">
      <span
        v-for="chapter in bookmark.chapter.parentChapters"
        :key="chapter.index"
        class="bookmark-parent-chapter-title"
      >
        {{ chapter.title }}
      </span>
      <span v-for="title in bookmark.chapter.titles" :key="title" class="bookmark-chapter-title">{{ title }}</span>
    </p>
    <p class="bookmark-text">
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
      <HighlightColorDropdown :color="bookmark.color" @update:color="(v) => emits('onColorChanged', v)" />
      <IconButton i18nKey="common.delete" @click="emits('onDeleteClick')">
        <DeleteIcon class="bookmark-action-icon" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DeleteIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBookmark } from '@/dto/kobo-book';
import { HighlightColor } from '@/enum/highlight-color';
import HighlightColorDropdown from '@/module/bookmarks/component/HighlightColorDropdown/HighlightColorDropdown.vue';

defineProps<{ bookmark: KoboBookmark }>();
const emits = defineEmits<{
  (e: 'onColorChanged', value: HighlightColor): void;
  (e: 'onDeleteClick'): void;
}>();
</script>

<style lang="scss" scoped>
@import './BookmarkItem';
</style>
