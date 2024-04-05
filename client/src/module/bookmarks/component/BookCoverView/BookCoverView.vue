<template>
  <div class="book-cover-view">
    <NImage v-if="book.coverImageUrl" class="book-cover-image" :src="book.coverImageUrl" :alt="book.info.title" />
    <div v-if="!book.coverImageUrl" class="fallback-book-cover">
      <span class="fallback-image-cover-text">
        {{ book.info.title }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NImage } from 'naive-ui';

import { KoboBook } from '@/dto/kobo-book';

defineProps<{ book: KoboBook }>();
</script>

<style lang="scss" scoped>
@import './BookCoverView';
</style>
