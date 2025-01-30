<template>
  <div class="book-item-simple" :style="{ top: stickyGap ? `${stickyGap}px` : '' }">
    <img class="simple-book-item-cover" :src="book.coverImageUrl" :alt="book.info.title" />
    <div class="simple-book-info">
      <router-link :to="linkTarget">
        <h3 class="simple-book-item-title">{{ book.info.title }}</h3>
      </router-link>
      <span class="simple-book-highlights-count">
        <i18n-t keypath="page.bookmarks.number_tagged_highlights" :plural="book.bookmarks.length">
          <b>{{ book.bookmarks.length }}</b>
        </i18n-t>
      </span>
    </div>
    <NCheckbox
      size="large"
      class="simple-book-item-checkbox"
      aria-label="check"
      :checked="selected"
      @update:checked="(v) => emit('update:selected', v)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NCheckbox } from 'naive-ui';
import { useRoute, RouteLocationRaw } from 'vue-router';

import { KoboBook } from '@/dto/kobo-book';
import { encodeBookId } from '@/util/book-id-encode';

const props = defineProps<{ book: KoboBook; selected?: boolean; stickyGap?: number }>();
const emit = defineEmits<{ (e: 'update:selected', value: boolean): void }>();

const route = useRoute();

const linkTarget = computed<RouteLocationRaw>(() => {
  const bookId = encodeBookId(props.book.id);
  const { collectionId, tagId } = route.params;
  if (collectionId && tagId) {
    return { name: 'collectionWithTag', params: { collectionId, tagId, bookId } };
  }
  if (collectionId) {
    return { name: 'collections', params: { collectionId, bookId } };
  }
  if (tagId) {
    return { name: 'tags', params: { tagId, bookId } };
  }
  return { name: 'bookmarks', params: { bookId } };
});
</script>

<style lang="scss" scoped>
@forward './BookItemSimple';
</style>
