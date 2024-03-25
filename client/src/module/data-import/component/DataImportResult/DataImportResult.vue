<template>
  <div class="data-import-result">
    <div class="data-import-result-header">
      <h1 class="data-import-result-title">
        <i18n-t keypath="page.data_import.bookmark_changes" />
      </h1>
      <span v-if="!bookChanges.length" class="data-import-result-info-text">
        <i18n-t keypath="page.data_import.no_change" />
      </span>
      <div v-if="bookChanges.length">
        <span class="data-import-result-info-text">
          {{ bookChanges.length }} {{ booksWording }}, {{ changedBookmarksCount }} {{ bookmarksWording }}
          <i18n-t keypath="page.data_import.changed" />
        </span>
      </div>
    </div>

    <BookChanges v-for="bookChange of bookChanges" :key="bookChange.book.id" :bookChange="bookChange" />

    <div class="data-import-result-footer">
      <div class="data-import-result-info">
        <NButton @click="emits('onDiscardClick')">
          <i18n-t keypath="page.data_import.discard_changes" />
        </NButton>
        <NButton type="primary" @click="emits('onSaveClick')">
          <i18n-t keypath="page.data_import.save_changes" />
        </NButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges } from '@/dto/kobo-book';
import BookChanges from '@/module/data-import/component/BookChanges/BookChanges.vue';

const props = defineProps<{ bookChanges: KoboBookChanges[] }>();
const emits = defineEmits<{ (e: 'onDiscardClick'): void; (e: 'onSaveClick'): void }>();

const { t } = useI18n<[I18NMessageSchema]>();

const booksWording = computed(() => t('page.data_import.imported_book', [], props.bookChanges.length));
const changedBookmarksCount = computed(() => props.bookChanges.reduce((count, book) => count + book.changes.length, 0));
const bookmarksWording = computed(() => t('page.data_import.imported_bookmark', [], changedBookmarksCount.value));
</script>

<style lang="scss" scoped>
@import './DataImportResult';
</style>
