<template>
  <div class="icon-label">
    <div class="icon-label-icon-container" :class="{ 'icon-label-clickable': clickable }">
      <component :is="icon" :class="iconClass || 'icon-24'" @click="onIconClick" />
    </div>
    <span>{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
import { VNodeChild } from 'vue';

const props = defineProps<{ icon: () => VNodeChild; iconClass?: string; label: string; clickable?: boolean }>();
const emits = defineEmits<{ (e: 'iconClick'): void }>();

function onIconClick(event: PointerEvent): void {
  if (!props.clickable) {
    return;
  }
  event.stopPropagation();
  event.preventDefault();
  emits('iconClick');
}
</script>

<style lang="scss" scoped>
@import './IconLabel';
</style>
