<template>
  <NPopover trigger="hover" :delay="500" :disabled="loading || waitForMouseLeave">
    <template #trigger>
      <NButton
        ref="elementRef"
        secondary
        round
        v-bind="$attrs"
        class="icon-button"
        :class="{ 'icon-button-loading': loading }"
        :disabled="disabled"
        :loading="loading"
        @click="onClick"
        @mouseleave="waitForMouseLeave = false"
        @focusout="waitForMouseLeave = false"
      >
        <div class="icon-button-icon-container">
          <slot />
        </div>
        <i18n-t :keypath="i18nKey" />
      </NButton>
    </template>
    <i18n-t :keypath="i18nKey" />
  </NPopover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { NButton, NPopover } from 'naive-ui';

const props = defineProps<{ i18nKey: string; disabled?: boolean; loading?: boolean; keepPopoverWhenClick?: boolean }>();
const emit = defineEmits<{ (e: 'click', value: MouseEvent): void }>();

const waitForMouseLeave = ref<boolean>(false);

function onClick(event: MouseEvent): void {
  if (!props.keepPopoverWhenClick) {
    waitForMouseLeave.value = true;
  }
  emit('click', event);
}
</script>

<style lang="scss" scoped>
@import './IconButton';
</style>
