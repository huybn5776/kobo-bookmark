<template>
  <NDropdown trigger="click" :options="options" @select="onDropdownSelect">
    <NButton class="bookmark-dropdown-menu-button" secondary round>
      <DotsVerticalIcon class="icon-20" />
      <i18n-t keypath="common.menu" />
    </NButton>
  </NDropdown>
</template>

<script lang="ts" setup>
import { computed, h } from 'vue';

import { NDropdown, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { DotsVerticalIcon, ArchiveIcon, ShareVariantIcon } from '@/component/icon';
import { I18NMessageSchema } from '@/config/i18n-config';

const emit = defineEmits<{ (e: 'createCardClick'): void; (e: 'archiveClick'): void }>();

const { t } = useI18n<[I18NMessageSchema]>();
const options = computed(() => {
  return [
    {
      key: 'create-bookmark-card',
      label: t('page.bookmarks.create_bookmark_card'),
      icon: () => h(ShareVariantIcon, { class: 'icon-24' }),
    },
    { key: 'archive', label: t('common.archive'), icon: () => h(ArchiveIcon, { class: 'icon-24' }) },
  ];
});

function onDropdownSelect(value: string): void {
  const actions: Record<string, () => void> = {
    'create-bookmark-card': () => emit('createCardClick'),
    archive: () => emit('archiveClick'),
  };
  actions[value]?.();
}
</script>

<style lang="scss" scoped>
@import './BookmarkDropdownMenu';
</style>
