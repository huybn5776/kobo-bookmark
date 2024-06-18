<template>
  <NPopover trigger="hover" :delay="500">
    <template #trigger>
      <div class="count-tag" :class="{ 'count-tag-inline': inline }">{{ countDisplay }}</div>
    </template>
    <i18n-t :keypath="keyPath" :plural="count">
      {{ count }}
    </i18n-t>
  </NPopover>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NPopover } from 'naive-ui';

const props = defineProps<{ count: number; keyPath: string; inline?: boolean }>();

const countDisplay = computed(() => Math.min(99, props.count));
</script>

<style lang="scss" scoped>
@import './CountTag';
</style>
