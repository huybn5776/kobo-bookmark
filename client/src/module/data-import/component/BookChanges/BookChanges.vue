<template>
  <div class="book-changes">
    <div class="book-changes-header">
      <h2 class="book-changes-title">{{ bookChange.book.info.title }}</h2>
      <span class="book-changes-info">{{ changesText }}</span>
    </div>

    <div v-if="!bookChange.bookRemoved" class="book-changes-bookmark-changes-container">
      <BookmarkChanges
        v-for="bookmarkChanges of bookChange.changes"
        :key="bookmarkChanges.id"
        :bookmarkChanges="bookmarkChanges"
      />
    </div>
    <span v-if="bookChange.bookRemoved" class="book-removed-message">
      <i18n-t keypath="page.data_import.book_absent" />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges, KoboBookmarkChangesType } from '@/dto/kobo-book';
import BookmarkChanges from '@/module/data-import/component/BookmarkChanges/BookmarkChanges.vue';

const props = defineProps<{ bookChange: KoboBookChanges }>();

const { t } = useI18n<[I18NMessageSchema]>();

const changesText = computed(() => {
  const addedCount = countChangesOfType(KoboBookmarkChangesType.Added);
  const updatedCount = countChangesOfType(KoboBookmarkChangesType.Updated);
  const removedCount = countChangesOfType(KoboBookmarkChangesType.Removed);

  const texts = [
    ...(addedCount ? [t('page.data_import.added', [addedCount], addedCount)] : []),
    ...(updatedCount ? [t('page.data_import.updated', [updatedCount], updatedCount)] : []),
    ...(removedCount ? [t('page.data_import.removed', [removedCount], removedCount)] : []),
  ];
  return texts.join(', ');
});

function countChangesOfType(type: KoboBookmarkChangesType): number {
  return props.bookChange.changes.filter((book) => book.type === type).length;
}
</script>

<style lang="scss" scoped>
@import './BookChanges';
</style>
