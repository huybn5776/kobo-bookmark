<template>
  <div class="icon-label">
    <button class="icon-label-icon-container" :class="{ 'icon-label-clickable': clickable }" @click="onIconClick">
      <slot />
    </button>
    <span class="icon-label-text">{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ iconClass?: string; label: string; clickable?: boolean }>();
const emit = defineEmits<{ (e: 'iconClick'): void }>();

function onIconClick(event: MouseEvent): void {
  if (!props.clickable) {
    return;
  }
  event.stopPropagation();
  event.preventDefault();
  emit('iconClick');
}
</script>

<style lang="scss" scoped>
@import './IconLabel';
</style>
