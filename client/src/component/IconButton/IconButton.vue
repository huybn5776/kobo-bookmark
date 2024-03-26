<template>
  <NPopover trigger="hover" :delay="500">
    <template #trigger>
      <NButton secondary round v-bind="$attrs" class="icon-button">
        <slot />
      </NButton>
    </template>
    <slot />
  </NPopover>
</template>

<script lang="ts" setup>
import { NButton, NPopover } from 'naive-ui';

const emits = defineEmits<{ (e: 'onClick'): void }>();
</script>

<style lang="scss" scoped>
@import './IconButton';
</style>
