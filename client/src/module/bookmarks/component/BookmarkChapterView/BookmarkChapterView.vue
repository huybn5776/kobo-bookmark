<template>
  <p class="bookmark-chapter-view" :class="{ 'bookmark-chapter-archived': archived }">
    <span
      v-for="parentChapter in chapter.parentChapters"
      :key="parentChapter.index"
      class="bookmark-parent-chapter-title"
    >
      {{ parentChapter.title }}
    </span>
    <span v-for="title in chapter.titles" :key="title" class="bookmark-chapter-title">{{ title }}</span>
  </p>
</template>

<script lang="ts" setup>
import { KoboBookmarkChapter } from '@/dto/kobo-book';

defineProps<{ chapter: KoboBookmarkChapter; archived?: boolean }>();
</script>

<style lang="scss" scoped>
@import './BookmarkChapterView';
</style>
