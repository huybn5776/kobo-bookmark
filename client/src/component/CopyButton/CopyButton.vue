<template>
  <NPopover trigger="manual" :show="showPopover">
    <template #trigger>
      <NButton class="copy-button" size="small" v-bind="$attrs" @click="copy">
        <Icon name="content-copy" class="copy-button-icon" />
        <i18n-t keypath="common.copy" />
      </NButton>
    </template>
    <span :class="{ 'copy-button-shake': clickCount >= minLevelToShake }">{{ popoverText }}</span>
  </NPopover>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { NButton, NPopover } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import Icon from '@/component/icon/Icon.vue';
import { I18NMessageSchema } from '@/config/i18n-config';
import { waitMilliseconds } from '@/util/time-utils';

const props = defineProps<{ content: string }>();

const { t } = useI18n<[I18NMessageSchema]>();

const popoverTexts = [
  () => t('common.copied_message.1'),
  () => t('common.copied_message.2'),
  () => t('common.copied_message.3'),
  () => t('common.copied_message.4'),
  () => t('common.copied_message.5'),
  () => t('common.copied_message.6'),
  () => t('common.copied_message.7'),
  () => t('common.copied_message.8'),
  () => t('common.copied_message.9'),
  () => t('common.copied_message.10'),
  () => t('common.copied_message.11'),
];
const minLevelToShake = 9;

const showPopover = ref<boolean>(false);
const clickCount = ref(0);
const lastHideTimeout = ref<ReturnType<typeof setTimeout>>();
const lastColdDownTimeout = ref<ReturnType<typeof setTimeout>>();
const popoverText = computed(() => popoverTexts[Math.min(popoverTexts.length - 1, clickCount.value - 1)]());

async function copy(): Promise<void> {
  clearTimeout(lastHideTimeout.value);
  clearTimeout(lastColdDownTimeout.value);

  if (showPopover.value) {
    await closePopover();
  }

  await navigator.clipboard.writeText(props.content);
  clickCount.value += 1;
  showPopover.value = true;
  lastHideTimeout.value = setTimeout(() => {
    showPopover.value = false;
    lastColdDownTimeout.value = setTimeout(() => (clickCount.value = 0), 1000);
  }, 1000);
}

async function closePopover(): Promise<void> {
  showPopover.value = false;
  await waitMilliseconds(100);
}
</script>

<style lang="scss" scoped>
@import './CopyButton';
</style>
