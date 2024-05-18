<template>
  <div v-if="bookCollection" class="active-book-collection">
    <h1 class="active-book-collection-name">
      <span>{{ bookCollection?.name }}</span>
      <IconButton class="deactivate-book-collection-button" i18nKey="common.close" @click="emits('closeClick')">
        <CloseCircleIcon class="icon-24" />
      </IconButton>
    </h1>
    <p class="active-book-collection-subtitle">
      <i18n-t keypath="page.bookmarks.selected_book_collection" :plural="bookCollection.bookIds.length">
        {{ bookCollection.bookIds.length }}
      </i18n-t>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { CloseCircleIcon } from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { BookCollection } from '@/dto/book-collection';

defineProps<{ bookCollection: BookCollection | undefined }>();
const emits = defineEmits<{ (e: 'closeClick'): void }>();
</script>

<style lang="scss" scoped>
@import './ActiveBookCollectionView';
</style>
