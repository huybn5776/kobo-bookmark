<template>
  <div class="bookmark-changes">
    <span v-if="bookmarkChanges.type === KoboBookmarkChangesType.Added" class="bookmark-changes-tag changes-added">
      <i18n-t keypath="page.data_import.added_tag" />
    </span>
    <span v-if="bookmarkChanges.type === KoboBookmarkChangesType.Updated" class="bookmark-changes-tag changes-updated">
      <i18n-t keypath="page.data_import.updated_tag" />
    </span>
    <span v-if="bookmarkChanges.type === KoboBookmarkChangesType.Removed" class="bookmark-changes-tag changes-removed">
      <i18n-t keypath="page.data_import.removed_tag" />
    </span>
    <span class="changes-content">{{ bookmarkChanges.current?.text || bookmarkChanges.original?.text }}</span>
  </div>
</template>

<script lang="ts" setup>
import { KoboBookmarkChanges, KoboBookmarkChangesType } from '@/dto/kobo-book';

defineProps<{ bookmarkChanges: KoboBookmarkChanges }>();
</script>

<style lang="scss" scoped>
@import './BookmarkChanges';
</style>
