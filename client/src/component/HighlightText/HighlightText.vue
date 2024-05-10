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

const readableText = computed(() => props.text?.replaceAll(highlightSyntax, '') || '');

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
  let processingText = originalText;

  const regexp = new RegExp(search, 'i');
  const results: SyntaxSegment[] = [];
  while (processingText) {
    const nextIndex = processingText.search(regexp);
    if (nextIndex === -1) {
      break;
    }
    results.push({ text: processingText.slice(0, nextIndex) });
    results.push({ text: processingText.slice(nextIndex, nextIndex + search.length), inSyntax: true });
    processingText = processingText.slice(nextIndex + search.length);
  }
  if (processingText) {
    results.push({ text: processingText });
  }

  return results;
}
</script>

<style lang="scss" scoped>
@import './HighlightText';
</style>
