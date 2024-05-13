<template>
  <p class="bookmark-chapter-view" :class="{ 'bookmark-chapter-archived': archived }">
    <span v-for="parentChapter in parentChapters" :key="parentChapter.index" class="bookmark-parent-chapter-title">
      {{ parentChapter.title }}
    </span>
    <span v-for="title in titles" :key="title" class="bookmark-chapter-title">{{ title }}</span>
  </p>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { prop } from 'ramda';

import { KoboBookmarkChapter, KoboBookChapter } from '@/dto/kobo-book';

const props = defineProps<{
  chapterIndexMap: Record<number, KoboBookChapter>;
  chapter: KoboBookmarkChapter;
  archived?: boolean;
}>();

const parentChapters = computed<KoboBookChapter[]>(() => {
  return (props.chapter.parentChapterIndexes || []).map((index) => props.chapterIndexMap[index]);
});
const titles = computed(() => {
  const relatedChapters = props.chapter.relatedChapterIndexes.map((index) => props.chapterIndexMap[index]);
  return relatedChapters.map(prop('title'));
});
</script>

<style lang="scss" scoped>
@import './BookmarkChapterView';
</style>
