<template>
  <div class="multi-book-action-bar">
    <span class="multi-book-action-text">
      <b>{{ selectedBooks.length }}</b
      >&nbsp;<span class="multi-book-action-selected-text"><i18n-t keypath="common.selected" /></span>
    </span>
    <div class="multi-book-actions">
      <IconButton v-if="!readonly" i18nKey="common.archive_selected" @click="emits('onArchiveClick')">
        <ArchiveIcon class="icon-24" />
      </IconButton>
      <IconButton v-if="!readonly" i18nKey="common.delete_selected" @click="emits('onDeleteClick')">
        <DeleteIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="common.export_selected" @click="emits('onExportBookFileClick')">
        <ExportIcon class="icon-24" />
      </IconButton>
      <IconButton v-if="!readonly" i18nKey="page.bookmarks.share_dropbox" @click="emits('onShareClick')">
        <DropboxShareIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_text" @click="emits('onTextExportClick')">
        <TextIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_markdown" @click="emits('onMarkdownExportClick')">
        <MarkdownIcon class="icon-24" />
      </IconButton>
      <IconButton i18nKey="page.bookmarks.export_all_notion" @click="emits('onNotionExportClick')">
        <NotionIcon class="icon-24" />
      </IconButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
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

defineProps<{ selectedBooks: KoboBook[]; readonly?: boolean; exportNotionLoading?: boolean }>();
const emits = defineEmits<{
  (e: 'onTextExportClick'): void;
  (e: 'onMarkdownExportClick'): void;
  (e: 'onNotionExportClick'): void;
  (e: 'onExportBookFileClick'): void;
  (e: 'onArchiveClick'): void;
  (e: 'onDeleteClick'): void;
  (e: 'onShareClick'): void;
}>();
</script>

<style lang="scss" scoped>
@import './MultiBookActionBar';
</style>
