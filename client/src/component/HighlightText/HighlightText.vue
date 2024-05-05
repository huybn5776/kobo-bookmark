<template>
  <span class="highlighter">
    <span v-for="(segment, index) of textSegments" :key="index" :class="{ 'highlight-text': segment.highlight }">
      {{ segment.text }}
    </span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ text?: string; search?: string }>();

const textSegments = computed<{ text?: string; highlight?: boolean }[]>(() => {
  if (!props.text || !props.search) {
    return [{ text: props.text }];
  }
  const results = props.text.split(props.search).flatMap((text) => {
    return [{ text }, { text: props.search, highlight: true }];
  });
  return results.slice(0, -1);
});
</script>

<style lang="scss" scoped>
@import './HighlightText';
</style>
