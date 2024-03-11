<template>
  <div class="data-import-result">
    <div class="data-import-result-header">
      <h1 class="data-import-result-title">Bookmark changes</h1>
      <span v-if="!bookChanges.length" class="data-import-result-info-text">No change</span>
      <div v-if="bookChanges.length">
        <span class="data-import-result-info-text">
          {{ bookChanges.length }} {{ booksWording }}, {{ changedBookmarksCount }} {{ bookmarksWording }} changed
        </span>
      </div>
    </div>

    <BookChanges v-for="bookChange of bookChanges" :key="bookChange.book.id" :bookChange="bookChange" />

    <div class="data-import-result-footer">
      <div class="data-import-result-info">
        <NButton @click="emits('onDiscardClick')">Discard changes</NButton>
        <NButton type="primary" @click="emits('onSaveClick')">Save changes</NButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NButton } from 'naive-ui';

import { KoboBookChanges } from '@/dto/kobo-book';
import BookChanges from '@/module/data-import/component/BookChanges/BookChanges.vue';

const props = defineProps<{ bookChanges: KoboBookChanges[] }>();
const emits = defineEmits<{ (e: 'onDiscardClick'): void; (e: 'onSaveClick'): void }>();

const booksWording = computed(() => (props.bookChanges.length > 1 ? 'books' : 'book'));
const changedBookmarksCount = computed(() => props.bookChanges.reduce((count, book) => count + book.changes.length, 0));
const bookmarksWording = computed(() => (changedBookmarksCount.value > 1 ? 'bookmarks' : 'bookmark'));
</script>

<style lang="scss" scoped>
@import './DataImportResult';
</style>
