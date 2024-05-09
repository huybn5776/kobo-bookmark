<template>
  <span class="highlighter">
    <span v-for="(segment, index) of textSegments" :key="index" :class="{ 'highlight-text': segment.inSyntax }">
      {{ segment.text }}
    </span>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { highlightSyntax } from '@/const/consts';
import { SyntaxSegment } from '@/interface/syntax-segment';
import { toSyntaxSegment } from '@/util/text-syntax-utils';

const props = defineProps<{ text?: string; search?: string }>();

const readableText = computed(() => props.text?.split(highlightSyntax).join('') || '');

const textSegments = computed<SyntaxSegment[]>(() => {
  if (readableText.value && props.search) {
    return processBySearch(readableText.value, props.search);
  }
  if (props.text) {
    return toSyntaxSegment(props.text, highlightSyntax);
  }
  return [{ text: props.text || '' }];
});

function processBySearch(originalText: string, search: string): SyntaxSegment[] {
  return originalText
    .split(search)
    .flatMap((text) => [{ text }, { text: search, inSyntax: true }])
    .slice(0, -1);
}
</script>

<style lang="scss" scoped>
@import './HighlightText';
</style>
