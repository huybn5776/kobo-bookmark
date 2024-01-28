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
      {{ props.bookmark.text }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { KoboBookmark } from '@/dto/kobo-book';

const props = defineProps<{ bookmark: KoboBookmark }>();
</script>

<style lang="scss" scoped>
@import 'BookmarkItem';
</style>
