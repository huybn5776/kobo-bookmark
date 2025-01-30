<template>
  <div class="home-page-playground-download-section">
    <p class="playground-section-title">
      <i18n-t keypath="page.home.playground_title" />
    </p>
    <p class="playground-section-description">
      <i18n-t keypath="page.home.playground_description">
        <a :href="playgroundBooksUrl" class="playground-link" download>
          <i18n-t keypath="page.home.playground_description_download" />
        </a>
        <router-link :to="{ name: 'import' }" class="playground-link">
          <i18n-t keypath="page_name.import" />
        </router-link>
      </i18n-t>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{ languageType: string }>();

const playgroundBooksUrl = computed(
  () =>
    (props.languageType === 'zh'
      ? new URL('/src/assets/intro/zh-tw/playground-books_zh-tw.json', import.meta.url)
      : new URL('/src/assets/intro/en/playground-books_en.json', import.meta.url)
    ).href,
);
</script>

<style lang="scss" scoped>
@forward './PlaygroundDownloadSection';
</style>
