<template>
  <NPopover trigger="hover" :delay="500" :disabled="loading">
    <template #trigger>
      <NButton
        secondary
        round
        v-bind="$attrs"
        class="icon-button"
        :class="{ 'icon-button-loading': loading }"
        :loading="loading"
        @onClick="emits('onClick')"
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
import { NButton, NPopover } from 'naive-ui';

defineProps<{ i18nKey: string; loading?: boolean }>();
const emits = defineEmits<{ (e: 'onClick'): void }>();
</script>

<style lang="scss" scoped>
@import './IconButton';
</style>
