<template>
  <div class="feature-introduction-section" :class="{ 'feature-introduction-section-flipped': flip }">
    <div class="introduction-image-container">
      <div class="introduction-image-background">
        <slot name="image" />
      </div>
      <div class="introduction-image">
        <slot name="image" />
      </div>
    </div>

    <div class="introduction-text">
      <FormatQuoteOpenIcon class="introduction-decoration-start" />
      <h1 class="introduction-title">
        <i18n-t :keypath="titleKey" />
      </h1>
      <p class="introduction-description">
        <i18n-t :keypath="descriptionKey" />
      </p>
      <FormatQuoteCloseIcon class="introduction-decoration-end" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FormatQuoteOpenIcon, FormatQuoteCloseIcon } from '@/component/icon';

defineProps<{ titleKey: string; descriptionKey: string; flip?: boolean }>();
</script>

<style lang="scss" scoped>
@import './FeatureIntroductionSection';
</style>
