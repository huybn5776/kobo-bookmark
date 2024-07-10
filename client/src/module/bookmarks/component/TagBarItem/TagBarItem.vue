<template>
  <div class="tag-bar-item">
    <span class="tag-bar-item-text">{{ label }}</span>
    <button v-if="allowRemove" class="tag-bar-item-remove-button" @click="onRemoveClick">
      <i18n-t keypath="common.remove" />
      <CloseIcon class="icon-14" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { CloseIcon } from '@/component/icon';

defineProps<{ label: string; allowRemove?: boolean }>();
const emits = defineEmits<{ (e: 'removeClick'): void }>();

function onRemoveClick(event: MouseEvent): void {
  event.stopPropagation();
  emits('removeClick');
}
</script>

<style lang="scss" scoped>
@import './TagBarItem';
</style>
