<template>
  <div class="feature-introduction-section">
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
    <slot name="image" />
  </div>
</template>

<script lang="ts" setup>
import { FormatQuoteOpenIcon, FormatQuoteCloseIcon } from '@/component/icon';

defineProps<{ titleKey: string; descriptionKey: string }>();
</script>

<style lang="scss" scoped>
@import './FeatureIntroductionSection';
</style>
