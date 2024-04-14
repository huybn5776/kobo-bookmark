<template>
  <div class="page-loading">
    <NSpin size="large" />
    <div class="loading-message">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NSpin } from 'naive-ui';
</script>

<style lang="scss" scoped>
@import './PageLoading';
</style>
