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
      <Icon name="format-quote-open" class="introduction-decoration-start" />
      <h1 class="introduction-title">
        <i18n-t :keypath="titleKey" />
      </h1>
      <p class="introduction-description">
        <i18n-t :keypath="descriptionKey" />
      </p>
      <Icon name="format-quote-close" class="introduction-decoration-end" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '@/component/icon/Icon.vue';

defineProps<{ titleKey: string; descriptionKey: string; flip?: boolean }>();
</script>

<style lang="scss" scoped>
@forward './FeatureIntroductionSection';
</style>
