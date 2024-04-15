<template>
  <div class="page-result">
    <NSpin v-if="!state" size="large" />
    <AlertIcon v-if="state === 'warning'" class="page-result-state-icon" />
    <CloseCircleIcon v-if="state === 'error'" class="page-result-state-icon" />
    <div class="page-result-message" :class="{ 'page-result-message-primary': state !== 'loading' }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSpin } from 'naive-ui';

import { AlertIcon, CloseCircleIcon } from '@/component/icon';

defineProps<{ state?: 'loading' | 'warning' | 'error' }>();
</script>

<style lang="scss" scoped>
@import './PageResult';
</style>
