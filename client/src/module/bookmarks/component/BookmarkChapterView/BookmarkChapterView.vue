<template>
  <p v-if="showContent" class="bookmark-chapter-view" :class="{ 'bookmark-chapter-archived': archived }">
    <BookmarkChapterViewContent :chapterIndexMap="chapterIndexMap" :chapter="chapter" />
    <slot />
  </p>
  <div v-if="!showContent" class="bookmark-chapter-empty-view">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBookmarkChapter, KoboBookChapter } from '@/dto/kobo-book';
import BookmarkChapterViewContent from '@/module/bookmarks/component/BookmarkChapterViewContent/BookmarkChapterViewContent.vue';

const props = defineProps<{
  showChapterContent: boolean;
  chapterIndexMap: Record<number, KoboBookChapter>;
  chapter: KoboBookmarkChapter;
  archived?: boolean;
}>();

const showContent = computed(() => props.showChapterContent && !!props.chapter.relatedChapterIndexes.length);
</script>

<style lang="scss" scoped>
@import './BookmarkChapterView';
</style>
