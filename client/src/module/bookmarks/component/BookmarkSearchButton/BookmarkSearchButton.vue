<template>
  <NButton
    secondary
    round
    class="bookmark-search-button"
    :class="{ 'bookmark-search-button-active': activeModel }"
    :disabled="disabled"
    @click="activeModel = !activeModel"
  >
    <template v-if="!activeModel">
      <MagnifyIcon class="icon-24" />
      <i18n-t keypath="common.search" />
    </template>
    <template v-if="activeModel">
      <CloseCircleIcon class="icon-24" />
      <i18n-t keypath="common.close" />
    </template>
  </NButton>
</template>

<script lang="ts" setup>
import { NButton } from 'naive-ui';

import { MagnifyIcon, CloseCircleIcon } from '@/component/icon';

defineProps<{ disabled?: boolean }>();
const activeModel = defineModel<boolean>('active');
</script>

<style lang="scss" scoped>
@import './BookmarkSearchButton';
</style>
