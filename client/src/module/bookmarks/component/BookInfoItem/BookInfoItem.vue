<template>
  <NPopover trigger="hover" :delay="500">
    <template #trigger>
      <div class="book-info-item" v-bind="$attrs">
        <slot />
      </div>
    </template>
    <i18n-t :keypath="i18nKey" />
  </NPopover>
</template>

<script lang="ts" setup>
import { NPopover } from 'naive-ui';

defineProps<{ i18nKey: string }>();
</script>

<style lang="scss" scoped>
@forward './BookInfoItem';
</style>
