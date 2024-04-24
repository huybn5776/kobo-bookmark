<template>
  <NPopover trigger="hover" :delay="500" :disabled="loading || waitForMouseLeave">
    <template #trigger>
      <NButton
        secondary
        round
        v-bind="$attrs"
        class="icon-button"
        :class="{ 'icon-button-loading': loading }"
        :loading="loading"
        @click="onClick"
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

defineProps<{ i18nKey: string; loading?: boolean }>();
const emits = defineEmits<{ (e: 'click'): void }>();

const waitForMouseLeave = ref<boolean>(false);

function onClick(event: MouseEvent): void {
  waitForMouseLeave.value = true;
  (event.target as HTMLElement).addEventListener('mouseleave', () => (waitForMouseLeave.value = false), { once: true });
  emits('click');
}
</script>

<style lang="scss" scoped>
@import './IconButton';
</style>
