<template>
  <div class="page-content home-page">
    <div class="home-page-heading-section">
      <div class="home-page-heading">
        <div class="home-page-heading-text-container">
          <h1 ref="headingTitleRef" class="home-page-heading-title">
            <i18n-t keypath="page.home.heading_title" />
          </h1>
          <p class="home-page-heading-description">
            <i18n-t keypath="page.home.heading_description">
              <a href="https://www.kobo.com/ww/ereaders" target="_blank">kobo</a>
            </i18n-t>
          </p>
        </div>
        <BookShapeGraph />
        <router-link :to="{ name: 'import' }">
          <NButton class="home-page-heading-button" size="large" type="primary">
            <i18n-t keypath="page.home.heading_try_now" />
          </NButton>
        </router-link>
      </div>

      <div class="home-page-demo-view">
        <h2 class="home-page-demo-ribbon">
          <i18n-t keypath="page.home.demo" />
        </h2>
        <DemoBookView class="home-page-demo-book" />
      </div>
    </div>

    <div class="home-page-divider" />

    <div class="home-page-feature-introduction">
      <FeatureIntroductionSection
        titleKey="page.home.notion_export_title"
        descriptionKey="page.home.notion_export_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/notion-export.jpg" alt="Notion" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/notion-export.jpg" alt="Notion" />
        </template>
      </FeatureIntroductionSection>
      <FeatureIntroductionSection
        titleKey="page.home.bookmark_search_title"
        descriptionKey="page.home.bookmark_search_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/bookmark-search.jpg" alt="Search" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/bookmark-search.jpg" alt="Search" />
        </template>
      </FeatureIntroductionSection>
      <FeatureIntroductionSection
        titleKey="page.home.bookmark_editing_title"
        descriptionKey="page.home.bookmark_editing_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/bookmark-editing.jpg" alt="Changes" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/bookmark-editing.jpg" alt="Changes" />
        </template>
      </FeatureIntroductionSection>
      <FeatureIntroductionSection
        titleKey="page.home.book_collection_title"
        descriptionKey="page.home.book_collection_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/book-collection.jpg" alt="Changes" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/book-collection.jpg" alt="Changes" />
        </template>
      </FeatureIntroductionSection>
      <FeatureIntroductionSection
        titleKey="page.home.bookmark_card_title"
        descriptionKey="page.home.bookmark_card_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/bookmark-card.jpg" alt="Changes" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/bookmark-card.jpg" alt="Changes" />
        </template>
      </FeatureIntroductionSection>
      <FeatureIntroductionSection
        titleKey="page.home.bookmark_share_title"
        descriptionKey="page.home.bookmark_share_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/bookmark-share.jpg" alt="Changes" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/bookmark-share.jpg" alt="Changes" />
        </template>
      </FeatureIntroductionSection>
      <FeatureIntroductionSection
        titleKey="page.home.confirm_changes_title"
        descriptionKey="page.home.confirm_changes_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/confirm-changes.jpg" alt="Changes" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/confirm-changes.jpg" alt="Changes" />
        </template>
      </FeatureIntroductionSection>
    </div>

    <PlaygroundDownloadSection :languageType="languageType" />

    <div class="home-page-footer">
      <a class="github-link" href="https://github.com/huybn5776/kobo-bookmark" target="_blank">
        <GithubIcon class="github-icon" />
        GitHub
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';

import fitty from 'fitty';
import { NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { GithubIcon } from '@/component/icon';
import { I18NMessageSchema } from '@/config/i18n-config';
import BookShapeGraph from '@/module/home/component/BookShapeGraph/BookShapeGraph.vue';
import DemoBookView from '@/module/home/component/DemoBookView/DemoBookView.vue';
import FeatureIntroductionSection from '@/module/home/component/FeatureIntroductionSection/FeatureIntroductionSection.vue';
import PlaygroundDownloadSection from '@/module/home/component/PlaygroundDownloadSection/PlaygroundDownloadSection.vue';

const { locale } = useI18n<[I18NMessageSchema]>();

const languageType = computed(() => (locale.value.startsWith('zh') ? 'zh' : 'en'));
const headingTitleRef = ref<HTMLElement>();

onMounted(() => {
  if (headingTitleRef.value) {
    fitty(headingTitleRef.value, { minSize: 22, maxSize: 56 });
  }
});
</script>

<style lang="scss" scoped>
@import './HomePage';
</style>
