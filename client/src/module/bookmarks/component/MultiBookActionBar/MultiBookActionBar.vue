<template>
  <div class="multi-book-action-bar">
    <span class="multi-book-action-text">
      <b>{{ selectedBooks.length }}</b
      >&nbsp;<span class="multi-book-action-selected-text"><i18n-t keypath="common.selected" /></span>
      <i class="multi-book-action-scrollable-shadow-left" />
    </span>
    <div class="multi-book-actions">
      <IconButton v-if="!readonly" i18nKey="common.archive_selected" @click="emit('archiveClick')">
        <Icon name="archive" class="icon-24" />
      </IconButton>
      <IconButton v-if="!readonly" i18nKey="common.delete_selected" @click="emit('deleteClick')">
        <Icon name="delete" class="icon-24" />
      </IconButton>
      <IconButton
        v-if="!readonly && !collectionFilterEnabled"
        i18nKey="page.bookmarks.add_to_book_collection"
        @click="emit('addToCollectionClick')"
      >
        <Icon name="playlist-plus" class="icon-24" />
      </IconButton>
      <IconButton
        v-if="!readonly && collectionFilterEnabled"
        i18nKey="page.bookmarks.remove_from_book_collection"
        @click="emit('removeFromCollectionClick')"
      >
        <Icon name="playlist-minus" class="icon-24" />
      </IconButton>
      <IconButton i18nKey="common.export_selected" @click="emit('exportBookFileClick')">
        <Icon name="export" class="icon-24" />
      </IconButton>
      <IconButton v-if="!readonly" i18nKey="page.bookmarks.share_dropbox" @click="emit('shareClick')">
        <DropboxShareIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_text" @click="emit('textExportClick')">
        <Icon name="text" class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_markdown" @click="emit('markdownExportClick')">
        <Icon name="markdown" class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_notion" @click="emit('notionExportClick')">
        <Icon name="notion" class="icon-24" />
      </IconButton>
    </div>
    <i class="multi-book-action-scrollable-shadow-right" />
  </div>
</template>

<script lang="ts" setup>
import DropboxShareIcon from '@/component/icon/DropboxShareIcon/DropboxShareIcon.vue';
import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBook } from '@/dto/kobo-book';

defineProps<{
  selectedBooks: KoboBook[];
  readonly?: boolean;
  collectionFilterEnabled?: boolean;
  exportNotionLoading?: boolean;
}>();
const emit = defineEmits<{
  (e: 'textExportClick'): void;
  (e: 'markdownExportClick'): void;
  (e: 'notionExportClick'): void;
  (e: 'exportBookFileClick'): void;
  (e: 'addToCollectionClick'): void;
  (e: 'removeFromCollectionClick'): void;
  (e: 'archiveClick'): void;
  (e: 'deleteClick'): void;
  (e: 'shareClick'): void;
}>();
</script>

<style lang="scss" scoped>
@import './MultiBookActionBar';
</style>
