<template>
  <NDropdown :value="dropdownValue" trigger="click" :options="highlightOptions" @select="onColorSelect">
    <div class="highlight-color-dropdown">
      <IconButton i18nKey="page.bookmarks.change_highlight_color">
        <Icon name="format-color-highlight" class="bookmark-action-icon" />
      </IconButton>
      <i
        class="highlight-color-indicator"
        :class="{
          'highlight-color-indicator-yellow': color === HighlightColor.Yellow,
          'highlight-color-indicator-red': color === HighlightColor.Red,
          'highlight-color-indicator-green': color === HighlightColor.Green,
          'highlight-color-indicator-blue': color === HighlightColor.Blue,
          'highlight-color-indicator-pink': color === HighlightColor.Pink,
          'highlight-color-indicator-purple': color === HighlightColor.Purple,
        }"
      />
    </div>
  </NDropdown>
</template>

<script lang="ts" setup>
import { h, computed } from 'vue';

import { NDropdown } from 'naive-ui';
import { DropdownOption } from 'naive-ui/es/dropdown/src/interface';
import { useI18n } from 'vue-i18n';

import Icon from '@/component/icon/Icon.vue';
import IconButton from '@/component/IconButton/IconButton.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { HighlightColor } from '@/enum/highlight-color';
import ColorIcon from '@/module/bookmarks/component/ColorIcon/ColorIcon.vue';

const { t } = useI18n<[I18NMessageSchema]>();

const highlightOptions: DropdownOption[] = [
  { key: HighlightColor.Default, label: t('common.color.default') },
  { key: HighlightColor.Yellow, label: t('common.color.yellow'), icon: () => h(ColorIcon, { color: 'yellow' }) },
  { key: HighlightColor.Red, label: t('common.color.red'), icon: () => h(ColorIcon, { color: 'red' }) },
  { key: HighlightColor.Green, label: t('common.color.green'), icon: () => h(ColorIcon, { color: 'green' }) },
  { key: HighlightColor.Blue, label: t('common.color.blue'), icon: () => h(ColorIcon, { color: 'blue' }) },
  { key: HighlightColor.Pink, label: t('common.color.pink'), icon: () => h(ColorIcon, { color: 'pink' }) },
  { key: HighlightColor.Purple, label: t('common.color.purple'), icon: () => h(ColorIcon, { color: 'purple' }) },
];
const colorModel = defineModel<HighlightColor>('color');

const dropdownValue = computed(() => colorModel.value || HighlightColor.Default);

function onColorSelect(value?: HighlightColor): void {
  colorModel.value = value === HighlightColor.Default ? undefined : value;
}
</script>

<style lang="scss" scoped>
@forward './HighlightColorDropdown';
</style>
