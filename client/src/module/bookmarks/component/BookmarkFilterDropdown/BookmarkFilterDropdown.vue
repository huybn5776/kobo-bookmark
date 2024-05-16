<template>
  <NPopselect
    v-model:show="showPopSelect"
    multiple
    trigger="click"
    :options="options"
    :value="selectValue"
    @update:value="onSelect"
  >
    <NButton
      secondary
      round
      class="bookmark-filter-button"
      :disabled="disabled"
      :class="{ 'bookmark-filter-button-active': collectionModel || colorModel.length }"
    >
      <FilterIcon class="icon-24" />
      <i18n-t keypath="common.filter" />
    </NButton>
  </NPopselect>
</template>

<script lang="ts" setup>
import { h, computed, ref } from 'vue';

import { NButton, NPopselect, SelectOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { PlusIcon, PencilIcon, FilterIcon } from '@/component/icon';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { HighlightColor } from '@/enum/highlight-color';
import { SettingKey } from '@/enum/setting-key';
import ColorIconLabel from '@/module/bookmarks/component/ColorIconLabel/ColorIconLabel.vue';
import IconLabel from '@/module/bookmarks/component/IconLabel/IconLabel.vue';

defineProps<{ disabled?: boolean }>();
const emits = defineEmits<{
  (e: 'createCollectionClick'): void;
  (e: 'editCollectionClick', collectionId: string): void;
}>();
const collectionModel = defineModel<string>('collection');
const colorModel = defineModel<HighlightColor[]>('colors', { default: [] });

const { t } = useI18n<[I18NMessageSchema]>();

const createCollectionValue = 'create-collection';

const bookCollections = useSyncSetting(SettingKey.BookCollection);

const showPopSelect = ref<boolean>(false);

const selectValue = computed(() => [...(collectionModel.value ? [collectionModel.value] : []), ...colorModel.value]);
const options = computed<SelectOption[]>(() => {
  return [
    {
      key: 'book-collection',
      type: 'group',
      label: t('page.bookmarks.collection'),
      children: [
        ...(bookCollections.value?.collections || []).map((collection) => ({
          parent: 'book-collection',
          value: collection.id,
          label: () =>
            h(IconLabel, {
              icon: () => h(PencilIcon),
              iconClass: 'icon-20',
              label: `${collection.name} (${collection.bookIds.length})`,
              clickable: true,
              onIconClick: () => {
                emits('editCollectionClick', collection.id);
                showPopSelect.value = false;
              },
            }),
        })),
        {
          parent: 'book-collection',
          value: createCollectionValue,
          label: () => h(IconLabel, { icon: () => h(PlusIcon), label: t('page.bookmarks.create_collection') }),
        },
      ],
    },
    {
      key: 'color',
      type: 'group',
      label: t('page.bookmarks.highlight_color'),
      children: [
        {
          parent: 'color',
          value: HighlightColor.Yellow,
          label: () => h(ColorIconLabel, { color: 'yellow', label: t('common.color.yellow') }),
        },
        {
          parent: 'color',
          value: HighlightColor.Red,
          label: () => h(ColorIconLabel, { color: 'red', label: t('common.color.red') }),
        },
        {
          parent: 'color',
          value: HighlightColor.Green,
          label: () => h(ColorIconLabel, { color: 'green', label: t('common.color.green') }),
        },
        {
          parent: 'color',
          value: HighlightColor.Blue,
          label: () => h(ColorIconLabel, { color: 'blue', label: t('common.color.blue') }),
        },
        {
          parent: 'color',
          value: HighlightColor.Pink,
          label: () => h(ColorIconLabel, { color: 'pink', label: t('common.color.pink') }),
        },
        {
          parent: 'color',
          value: HighlightColor.Purple,
          label: () => h(ColorIconLabel, { color: 'purple', label: t('common.color.purple') }),
        },
      ],
    },
  ];
});

function onSelect(_: string, selectedOptions: (SelectOption & { parent: 'book-collection' | 'color' })[]): void {
  const selectedCollectionOptionsValue = selectedOptions
    .filter((option) => option.parent === 'book-collection')
    .map((option) => option.value as string);
  colorModel.value = selectedOptions
    .filter((option) => option.parent === 'color')
    .map((option) => option.value as HighlightColor);

  if (selectedCollectionOptionsValue.some((value) => value === createCollectionValue)) {
    emits('createCollectionClick');
    showPopSelect.value = false;
  } else {
    const lastSelectedCollection = collectionModel.value;
    if (selectedCollectionOptionsValue.length > 1) {
      collectionModel.value = selectedCollectionOptionsValue.find(
        (collection) => collection !== lastSelectedCollection,
      );
    } else if (selectedCollectionOptionsValue.length === 1) {
      [collectionModel.value] = selectedCollectionOptionsValue;
    } else {
      collectionModel.value = undefined;
    }
  }
}
</script>

<style lang="scss" scoped>
@import './BookmarkFilterDropdown';
</style>
