<template>
  <div class="book-search-button">
    <IconButton :i18nKey="i18nKey" @click="emit('click')">
      <Icon name="book-search" class="icon-24" />
    </IconButton>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';

const emit = defineEmits<{ (e: 'click'): void }>();

const i18nKey = computed(() =>
  navigator.userAgent.includes('Mac') ? 'page.bookmarks.book_search_cmd' : 'page.bookmarks.book_search_ctrl',
);
</script>

<style lang="scss" scoped>
@import './BookSearchButton';
</style>
