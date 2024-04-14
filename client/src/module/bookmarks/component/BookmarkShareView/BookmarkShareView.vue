<template>
  <div class="bookmark-share-view">
    <template v-if="bookmarkShare.title">
      <span class="bookmark-share-label">
        <i18n-t keypath="page.bookmarks.bookmark_share_title" />
      </span>
      <h1 class="bookmark-share-title">{{ bookmarkShare.title }}</h1>
    </template>

    <template v-if="bookmarkShare.description">
      <span class="bookmark-share-label">
        <i18n-t keypath="page.bookmarks.bookmark_share_description" />
      </span>
      <p class="bookmark-share-description">{{ bookmarkShare.description }}</p>
    </template>

    <template v-if="!bookmarkShare.title && !bookmarkShare.description">
      <span class="bookmark-share-label">
        <i18n-t keypath="page.bookmarks.shared_bookmarks" />
      </span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { BookmarkShare } from '@/dto/bookmark-share';

defineProps<{ bookmarkShare: BookmarkShare }>();
</script>

<style lang="scss" scoped>
@import './BookmarkShareView';
</style>
