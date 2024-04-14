<template>
  <div class="page-loading">
    <NSpin v-if="!state" size="large" />
    <AlertIcon v-if="state === 'warning'" class="page-loading-state-icon" />
    <CloseCircleIcon v-if="state === 'error'" class="page-loading-state-icon" />
    <div class="loading-message" :class="{ 'loading-message-primary': state }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSpin } from 'naive-ui';

import { AlertIcon, CloseCircleIcon } from '@/component/icon';

defineProps<{ state?: 'warning' | 'error' }>();
</script>

<style lang="scss" scoped>
@import './PageLoading';
</style>
