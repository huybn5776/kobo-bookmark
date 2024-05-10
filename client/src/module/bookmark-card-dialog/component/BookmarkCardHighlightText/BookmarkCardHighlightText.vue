<template>
  <div
    class="bookmark-card-highlight-text"
    :style="{
      '--card-highlight-text-bg': bg,
      '--card-highlight-text-fg': fg,
      '--card-highlight-inverse-bg': inverseBackgroundColor,
    }"
  >
    <template v-for="(segment, index) of textSegments" :key="index">
      <span v-if="!segment.inSyntax">{{ segment.text }}</span>
      <span
        v-if="segment.inSyntax"
        :class="{
          'highlight-style-background': highlightStyle === HighlightStyle.Background,
          'highlight-style-background-inverse': highlightStyle === HighlightStyle.BackgroundInverse,
          'highlight-style-background-all-inverse': highlightStyle === HighlightStyle.BackgroundAllInverse,
          'highlight-style-underline-wavy': highlightStyle === HighlightStyle.UnderlineWavy,
        }"
        >{{ segment.text }}</span
      >
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { highlightSyntax } from '@/const/consts';
import { HighlightStyle } from '@/enum/highlight-style';
import { SyntaxSegment } from '@/interface/syntax-segment';
import { toSyntaxSegment } from '@/util/text-syntax-utils';

const props = defineProps<{ text: string; bg: string; fg: string; highlightStyle: HighlightStyle }>();

const inverseBackgroundColor = computed(() => {
  // eslint-disable-next-line no-bitwise
  return `#${(Number(`0x1${props.bg.replace('#', '')}`) ^ 0xffffff).toString(16).substring(1)}`;
});
const textSegments = computed<SyntaxSegment[]>(() => toSyntaxSegment(props.text, highlightSyntax));
</script>

<style lang="scss" scoped>
@import './BookmarkCardHighlightText';
</style>
