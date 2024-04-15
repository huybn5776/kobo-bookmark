<template>
  <div class="color-icon-label">
    <ColorIcon :color="color" />
    <span>{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
import ColorIcon from '@/module/bookmarks/component/ColorIcon/ColorIcon.vue';

defineProps<{ color: string; label: string }>();
</script>

<style lang="scss" scoped>
@import './ColorIconLabel';
</style>
