<template>
  <div class="multi-line-text">
    <p v-for="text in texts" :key="text" class="multi-line-text-line">{{ text }}</p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ texts: string[] }>();
</script>

<style lang="scss" scoped>
@forward './MultiLineText';
</style>
