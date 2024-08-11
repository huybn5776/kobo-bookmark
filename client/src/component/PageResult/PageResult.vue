<template>
  <div class="page-result">
    <NSpin v-if="!state" size="large" />
    <Icon v-if="state === 'warning'" name="alert" class="page-result-state-icon" />
    <Icon v-if="state === 'error'" name="close-circle" class="page-result-state-icon" />
    <div class="page-result-message" :class="{ 'page-result-message-primary': state !== 'loading' }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSpin } from 'naive-ui';

import Icon from '@/component/icon/Icon.vue';

defineProps<{ state?: 'loading' | 'warning' | 'error' }>();
</script>

<style lang="scss" scoped>
@import './PageResult';
</style>
