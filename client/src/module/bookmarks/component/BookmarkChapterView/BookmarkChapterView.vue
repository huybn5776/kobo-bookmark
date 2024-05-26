<template>
  <p class="bookmark-chapter-view" :class="{ 'bookmark-chapter-archived': archived }">
    <BookmarkChapterViewContent :chapterIndexMap="chapterIndexMap" :chapter="chapter" />
  </p>
</template>

<script lang="ts" setup>
import { KoboBookmarkChapter, KoboBookChapter } from '@/dto/kobo-book';
import BookmarkChapterViewContent from '@/module/bookmarks/component/BookmarkChapterViewContent/BookmarkChapterViewContent.vue';

defineProps<{ chapterIndexMap: Record<number, KoboBookChapter>; chapter: KoboBookmarkChapter; archived?: boolean }>();
</script>

<style lang="scss" scoped>
@import './BookmarkChapterView';
</style>
