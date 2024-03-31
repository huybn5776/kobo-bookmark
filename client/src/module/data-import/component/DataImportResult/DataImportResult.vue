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
        <NDropdown
          v-if="bookChanges.length"
          trigger="click"
          placement="bottom-start"
          :options="exportChangesOptions"
          @select="onExportChangeSelected"
        >
          <NButton>
            <i18n-t keypath="page.data_import.export_changes" />
          </NButton>
        </NDropdown>
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
import { computed, h } from 'vue';

import { NButton, NDropdown, DropdownOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { TextIcon, MarkdownIcon } from '@/component/icon';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges } from '@/dto/kobo-book';
import BookChanges from '@/module/data-import/component/BookChanges/BookChanges.vue';

const props = defineProps<{ bookChanges: KoboBookChanges[] }>();
const emits = defineEmits<{
  (e: 'onExportTextFileClick'): void;
  (e: 'onExportTextClipboardClick'): void;
  (e: 'onExportMarkdownFileClick'): void;
  (e: 'onExportMarkdownClipboardClick'): void;
  (e: 'onDiscardClick'): void;
  (e: 'onSaveClick'): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const exportChangesOptions: DropdownOption[] = [
  { key: 'text-file', label: t('page.data_import.as_text_file'), icon: () => h(TextIcon, { class: 'icon-24' }) },
  {
    key: 'text-clipboard',
    label: t('page.data_import.as_text_clipboard'),
    icon: () => h(TextIcon, { class: 'icon-24' }),
  },
  {
    key: 'markdown-file',
    label: t('page.data_import.as_markdown_file'),
    icon: () => h(MarkdownIcon, { class: 'icon-24' }),
  },
  {
    key: 'markdown-clipboard',
    label: t('page.data_import.as_markdown_clipboard'),
    icon: () => h(MarkdownIcon, { class: 'icon-24' }),
  },
];

const booksWording = computed(() => t('page.data_import.imported_book', [], props.bookChanges.length));
const changedBookmarksCount = computed(() => props.bookChanges.reduce((count, book) => count + book.changes.length, 0));
const bookmarksWording = computed(() => t('page.data_import.imported_bookmark', [], changedBookmarksCount.value));

function onExportChangeSelected(id: string): void {
  const action = {
    'text-file': () => emits('onExportTextFileClick'),
    'text-clipboard': () => emits('onExportTextClipboardClick'),
    'markdown-file': () => emits('onExportMarkdownFileClick'),
    'markdown-clipboard': () => emits('onExportMarkdownClipboardClick'),
  }[id];
  action?.();
}
</script>

<style lang="scss" scoped>
@import './DataImportResult';
</style>
