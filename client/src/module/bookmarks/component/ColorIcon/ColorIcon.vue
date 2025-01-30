<template>
  <i class="color-icon" :style="{ backgroundColor: color }" />
</template>

<script lang="ts" setup>
defineProps<{ color: string }>();
</script>

<style lang="scss" scoped>
@forward './ColorIcon';
</style>
