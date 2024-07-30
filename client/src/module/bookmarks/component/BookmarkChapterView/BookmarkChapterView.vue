<template>
  <p v-if="hasChapter" class="bookmark-chapter-view" :class="{ 'bookmark-chapter-archived': archived }">
    <BookmarkChapterViewContent :chapterIndexMap="chapterIndexMap" :chapter="chapter" />
    <slot />
  </p>
  <div v-if="!hasChapter" class="bookmark-chapter-empty-view">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { KoboBookmarkChapter, KoboBookChapter } from '@/dto/kobo-book';
import BookmarkChapterViewContent from '@/module/bookmarks/component/BookmarkChapterViewContent/BookmarkChapterViewContent.vue';

const props = defineProps<{
  chapterIndexMap: Record<number, KoboBookChapter>;
  chapter: KoboBookmarkChapter;
  archived?: boolean;
}>();

const hasChapter = computed(() => !!props.chapter.relatedChapterIndexes.length);
</script>

<style lang="scss" scoped>
@import './BookmarkChapterView';
</style>
