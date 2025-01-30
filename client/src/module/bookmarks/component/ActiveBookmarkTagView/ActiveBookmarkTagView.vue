<template>
  <div class="active-bookmark-tag-view">
    <h2 class="active-bookmark-tag-title">
      <span>#{{ bookmarkTagTitle }}</span>
      <span class="active-bookmark-tag-count">× {{ bookmarksCount }}</span>
      <IconButton class="deactivate-bookmark-tag-button" i18nKey="common.close" @click="emit('closeClick')">
        <Icon name="close-circle" class="icon-24" />
      </IconButton>
    </h2>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBook } from '@/dto/kobo-book';

const props = defineProps<{ bookmarkTagTitle: string; books: KoboBook[] }>();
const emit = defineEmits<{ (e: 'closeClick'): void }>();

const bookmarksCount = computed(() => props.books.reduce((sum, book) => sum + book.bookmarks.length, 0));
</script>

<style lang="scss" scoped>
@forward './ActiveBookmarkTagView';
</style>
