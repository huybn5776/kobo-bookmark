<template>
  <div class="data-import-result">
    <div class="data-import-result-header">
      <h1 class="data-import-result-title">
        <i18n-t keypath="page.data_import.bookmark_changes" />
      </h1>
      <span v-if="!bookChangesToShow.length" class="data-import-result-info-text">
        <i18n-t keypath="page.data_import.no_change" />
      </span>
      <div v-if="bookChangesToShow.length">
        <span class="data-import-result-info-text">
          {{ bookChangesToShow.length }} {{ booksWording }}, {{ changedBookmarksCount }} {{ bookmarksWording }}
          <i18n-t keypath="page.data_import.changed" />
        </span>
      </div>
    </div>

    <div class="data-import-result-changes-container">
      <NCollapse v-model:expandedNames="expandedBookChanges">
        <NCollapseItem
          v-for="bookChange of bookChangesToShow"
          :key="bookChange.book.id"
          class="book-changes-collapse"
          :name="bookChange.book.id"
        >
          <template #header>
            <BookChangesHeader :bookChange="bookChange" />
          </template>
          <BookChanges :bookChange="bookChange" />
        </NCollapseItem>
      </NCollapse>
    </div>

    <div class="data-import-result-footer">
      <div class="data-import-result-info">
        <NDropdown
          v-if="bookChangesToShow.length"
          trigger="click"
          placement="bottom-start"
          :options="exportChangesOptions"
          @select="onExportChangeSelected"
        >
          <NButton>
            <i18n-t keypath="page.data_import.export_changes" />
          </NButton>
        </NDropdown>
        <NButton @click="emit('discardClick')">
          <i18n-t keypath="page.data_import.discard_changes" />
        </NButton>
        <NButton type="primary" @click="emit('saveClick')">
          <i18n-t keypath="page.data_import.save_changes" />
        </NButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, onMounted } from 'vue';

import { NButton, NDropdown, DropdownOption, NCollapseItem, NCollapse } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { TextIcon, MarkdownIcon } from '@/component/icon';
import { I18NMessageSchema } from '@/config/i18n-config';
import { KoboBookChanges } from '@/dto/kobo-book';
import { SettingKey } from '@/enum/setting-key';
import BookChanges from '@/module/data-import/component/BookChanges/BookChanges.vue';
import BookChangesHeader from '@/module/data-import/component/BookChangesHeader/BookChangesHeader.vue';
import { getSettingFromStorage } from '@/services/setting.service';

const props = defineProps<{ bookChanges: KoboBookChanges[] }>();
const emit = defineEmits<{
  (e: 'exportTextFileClick'): void;
  (e: 'exportTextClipboardClick'): void;
  (e: 'exportMarkdownFileClick'): void;
  (e: 'exportMarkdownClipboardClick'): void;
  (e: 'discardClick'): void;
  (e: 'saveClick'): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const bookChangesToShow = computed(() => {
  return getSettingFromStorage(SettingKey.ShowRemovedBooksWhenImporting)
    ? props.bookChanges
    : props.bookChanges.filter((changes) => !changes.bookRemoved);
});
const expandedBookChanges = ref<string[]>([]);

onMounted(() => {
  const expandableChanges = props.bookChanges.filter((changes) => !changes.bookRemoved);
  expandedBookChanges.value = expandableChanges.length === 1 ? [expandableChanges[0].book.id] : [];
});

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

const booksWording = computed(() => t('page.data_import.imported_book', [], bookChangesToShow.value.length));
const changedBookmarksCount = computed(() =>
  bookChangesToShow.value.reduce((count, book) => count + book.changes.length, 0),
);
const bookmarksWording = computed(() => t('page.data_import.imported_bookmark', [], changedBookmarksCount.value));

function onExportChangeSelected(id: string): void {
  const action = {
    'text-file': () => emit('exportTextFileClick'),
    'text-clipboard': () => emit('exportTextClipboardClick'),
    'markdown-file': () => emit('exportMarkdownFileClick'),
    'markdown-clipboard': () => emit('exportMarkdownClipboardClick'),
  }[id];
  action?.();
}
</script>

<style lang="scss" scoped>
@import './DataImportResult';
</style>
