<template>
  <button
    v-for="option of languageOptions"
    :key="option.value"
    class="page-menu-item page-menu-check-item"
    @click="switchLanguage(option.value)"
  >
    <CheckIcon v-if="language === option.value" class="page-menu-check-icon" />
    <span class="menu-item-text">{{ option.label }}</span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { CheckIcon } from '@/component/icon';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { I18NMessageSchema } from '@/config/i18n-config';
import { SettingKey } from '@/enum/setting-key';

const { t, locale } = useI18n<[I18NMessageSchema]>();

const languageOptions = computed(() => [
  { value: undefined, label: t('page.settings.misc.language_auto') },
  { value: 'en', label: 'English' },
  { value: 'zh-TW', label: '中文 (繁體)' },
]);

const language = useSyncSetting(SettingKey.Language);

function switchLanguage(lang: string | undefined): void {
  language.value = lang;
  if (!lang) {
    locale.value = navigator.language as typeof locale.value;
  } else {
    locale.value = lang as typeof locale.value;
  }
}
</script>

<style lang="scss" scoped>
@import '../../page-menu-modal';
</style>
