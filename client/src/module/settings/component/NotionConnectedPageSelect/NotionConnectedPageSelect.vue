<template>
  <NSelect
    clearable
    filterable
    :value="id"
    :options="optionsToShow"
    :loading="loading || loadingOptions"
    :disabled="disabled"
    :renderLabel="renderLabel"
    @update:value="onSelected"
    @updateShow="onSelectShowStateChanged"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NSelect, SelectOption } from 'naive-ui';
import { sortBy } from 'ramda';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';

const props = defineProps<{
  id: string | undefined;
  title: string | undefined;
  optionsGetter: () => Promise<SelectOption[]>;
  loading?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:id', value: string | undefined): void;
  (e: 'update:title', value: string | undefined): void;
}>();

const { t } = useI18n<[I18NMessageSchema]>();

const options = ref<SelectOption[]>([]);
const loadingOptions = ref(false);
const allOptionsLoaded = ref(false);

const optionsToShow = computed<SelectOption[]>(() => {
  return allOptionsLoaded.value
    ? options.value
    : [
        ...(props.id ? [{ value: props.id, label: props.title }] : []),
        { value: '', label: t('common.loading'), disabled: true },
      ];
});

function renderLabel(option: SelectOption): string {
  if (!option.value && !option.label) {
    return '';
  }
  return option.value ? `${option.label} - ${option.value}` : `${option.label}`;
}

function onSelected(id: string, option: SelectOption | null): void {
  emit('update:id', id);
  emit('update:title', option?.label?.toString());
}

async function onSelectShowStateChanged(show: boolean): Promise<void> {
  if (!show || allOptionsLoaded.value) {
    return;
  }
  loadingOptions.value = true;
  let newOptions = await props.optionsGetter();
  if (newOptions.length === 1 && newOptions[0].value === props.id) {
    newOptions = [...newOptions, { value: '', label: t('page.settings.notion.loading_nothing_more'), disabled: true }];
  }
  newOptions = sortBy((option) => option.value !== props.id, newOptions);
  options.value = newOptions;
  allOptionsLoaded.value = true;
  loadingOptions.value = false;
}
</script>
