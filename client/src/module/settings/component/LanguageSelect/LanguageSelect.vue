<template>
  <NSelect clearable :value="language || 'auto'" :options="options" @update:value="onSelected" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NSelect, SelectOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';

defineProps<{ language: string | undefined }>();
const emit = defineEmits<{ (e: 'update:language', value: string | undefined): void }>();

const { t, locale } = useI18n<[I18NMessageSchema]>();

const languageOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'zh-TW', label: '中文 (繁體)' },
];
const options = computed(() => {
  return [{ value: 'auto', label: t('page.settings.misc.language_auto') }, ...languageOptions];
});

function onSelected(id: string): void {
  if (id === 'auto') {
    emit('update:language', undefined);
    locale.value = navigator.language as typeof locale.value;
  } else {
    emit('update:language', id);
    locale.value = id as typeof locale.value;
  }
}
</script>
