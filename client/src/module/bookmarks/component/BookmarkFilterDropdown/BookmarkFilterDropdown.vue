<template>
  <NPopselect multiple trigger="click" :options="options" :value="colorModel" @update:value="colorModel = $event">
    <NButton
      secondary
      round
      class="bookmark-filter-button"
      :disabled="disabled"
      :class="{ 'bookmark-filter-button-active': colorModel.length }"
    >
      <FilterIcon class="icon-24" />
      <i18n-t keypath="common.filter" />
    </NButton>
  </NPopselect>
</template>

<script lang="ts" setup>
import { h } from 'vue';

import { NButton, NPopselect, SelectOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { FilterIcon } from '@/component/icon';
import { I18NMessageSchema } from '@/config/i18n-config';
import { HighlightColor } from '@/enum/highlight-color';
import ColorIconLabel from '@/module/bookmarks/component/ColorIconLabel/ColorIconLabel.vue';

defineProps<{ disabled?: boolean }>();
const colorModel = defineModel<HighlightColor[]>('colors', { default: [] });

const { t } = useI18n<[I18NMessageSchema]>();

const options: SelectOption[] = [
  {
    value: HighlightColor.Yellow,
    label: () => h(ColorIconLabel, { color: 'yellow', label: t('common.color.yellow') }),
  },
  { value: HighlightColor.Red, label: () => h(ColorIconLabel, { color: 'red', label: t('common.color.red') }) },
  { value: HighlightColor.Green, label: () => h(ColorIconLabel, { color: 'green', label: t('common.color.green') }) },
  { value: HighlightColor.Blue, label: () => h(ColorIconLabel, { color: 'blue', label: t('common.color.blue') }) },
  { value: HighlightColor.Pink, label: () => h(ColorIconLabel, { color: 'pink', label: t('common.color.pink') }) },
  {
    value: HighlightColor.Purple,
    label: () => h(ColorIconLabel, { color: 'purple', label: t('common.color.purple') }),
  },
];
</script>

<style lang="scss" scoped>
@import './BookmarkFilterDropdown';
</style>
