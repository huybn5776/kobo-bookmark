<template>
  <div class="multi-book-action-bar">
    <span class="multi-book-action-text">
      <b>{{ selectedBooks.length }}</b
      >&nbsp;<span class="multi-book-action-selected-text"><i18n-t keypath="common.selected" /></span>
    </span>
    <div class="multi-book-actions">
      <IconButton v-if="!readonly" i18nKey="common.archive_selected" @click="emits('archiveClick')">
        <ArchiveIcon class="icon-24" />
      </IconButton>
      <IconButton v-if="!readonly" i18nKey="common.delete_selected" @click="emits('deleteClick')">
        <DeleteIcon class="icon-24" />
      </IconButton>
      <IconButton
        v-if="!readonly && !collectionFilterEnabled"
        i18nKey="page.bookmarks.add_to_book_collection"
        @click="emits('addToCollectionClick')"
      >
        <PlaylistPlusIcon class="icon-24" />
      </IconButton>
      <IconButton
        v-if="!readonly && collectionFilterEnabled"
        i18nKey="page.bookmarks.remove_from_book_collection"
        @click="emits('removeFromCollectionClick')"
      >
        <PlaylistMinusIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="common.export_selected" @click="emits('exportBookFileClick')">
        <ExportIcon class="icon-24" />
      </IconButton>
      <IconButton v-if="!readonly" i18nKey="page.bookmarks.share_dropbox" @click="emits('shareClick')">
        <DropboxShareIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_text" @click="emits('textExportClick')">
        <TextIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_markdown" @click="emits('markdownExportClick')">
        <MarkdownIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_notion" @click="emits('notionExportClick')">
        <NotionIcon class="icon-24" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  PlaylistPlusIcon,
  PlaylistMinusIcon,
  ArchiveIcon,
  DeleteIcon,
  ExportIcon,
  MarkdownIcon,
  NotionIcon,
  TextIcon,
  DropboxShareIcon,
} from '@/component/icon';
import IconButton from '@/component/IconButton/IconButton.vue';
import { KoboBook } from '@/dto/kobo-book';

defineProps<{
  selectedBooks: KoboBook[];
  readonly?: boolean;
  collectionFilterEnabled?: boolean;
  exportNotionLoading?: boolean;
}>();
const emits = defineEmits<{
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
