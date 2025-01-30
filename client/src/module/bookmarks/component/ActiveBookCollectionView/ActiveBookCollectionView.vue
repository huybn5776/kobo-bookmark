<template>
  <div class="active-book-collection">
    <h1 class="active-book-collection-name">
      <span>{{ bookCollection?.name }}</span>
      <IconButton class="deactivate-book-collection-button" i18nKey="common.close" @click="emit('closeClick')">
        <Icon name="close-circle" class="icon-24" />
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
import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { BookCollection } from '@/dto/book-collection';

defineProps<{ bookCollection: BookCollection }>();
const emit = defineEmits<{ (e: 'closeClick'): void }>();
</script>

<style lang="scss" scoped>
@forward './ActiveBookCollectionView';
</style>
