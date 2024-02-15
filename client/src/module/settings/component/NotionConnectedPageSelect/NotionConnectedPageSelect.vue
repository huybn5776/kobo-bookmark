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

const props = defineProps<{
  id: string | undefined;
  title: string | undefined;
  optionsGetter: () => Promise<SelectOption[]>;
  loading?: boolean;
  disabled?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:id', value: string | undefined): void;
  (e: 'update:title', value: string | undefined): void;
}>();

const options = ref<SelectOption[]>([]);
const loadingOptions = ref(false);
const allOptionsLoaded = ref(false);

const optionsToShow = computed<SelectOption[]>(() => {
  return allOptionsLoaded.value
    ? options.value
    : [
        ...(props.id ? [{ value: props.id, label: props.title }] : []),
        { value: '', label: 'Loading...', disabled: true },
      ];
});

function renderLabel(option: SelectOption): string {
  if (!option.value && !option.label) {
    return '';
  }
  return option.value ? `${option.label} - ${option.value}` : `${option.label}`;
}

function onSelected(id: string, option: SelectOption | null): void {
  emits('update:id', id);
  emits('update:title', option?.label?.toString());
}

async function onSelectShowStateChanged(show: boolean): Promise<void> {
  if (!show || allOptionsLoaded.value) {
    return;
  }
  loadingOptions.value = true;
  let newOptions = await props.optionsGetter();
  if (newOptions.length === 1 && newOptions[0].value === props.id) {
    newOptions = [...newOptions, { value: '', label: 'There are nothing more', disabled: true }];
  }
  newOptions = sortBy((option) => option.value !== props.id, newOptions);
  options.value = newOptions;
  allOptionsLoaded.value = true;
  loadingOptions.value = false;
}
</script>
