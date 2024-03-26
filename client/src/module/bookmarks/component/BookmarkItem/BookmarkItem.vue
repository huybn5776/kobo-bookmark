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
    <blockquote v-if="props.bookmark.annotation" class="bookmark-annotation">
      {{ props.bookmark.annotation }}
    </blockquote>

    <div class="bookmark-toolbar">
      <IconButton class="bookmark-delete-button" @click="emits('onDeleteClick')" >
        <i18n-t keypath="common.delete" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBookmark } from '@/dto/kobo-book';

const props = defineProps<{ bookmark: KoboBookmark }>();
const emits = defineEmits<{
  (e: 'onDeleteClick'): void;
}>();
</script>

<style lang="scss" scoped>
@import 'BookmarkItem';
</style>
