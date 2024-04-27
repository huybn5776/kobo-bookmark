<template>
  <div class="page-content home-page">
    <div class="home-page-heading-section">
      <div class="home-page-heading">
        <h1 class="home-page-heading-title">
          <i18n-t keypath="page.home.heading_title" />
        </h1>
        <p class="home-page-heading-description">
          <i18n-t keypath="page.home.heading_description" />
        </p>
        <router-link :to="{ name: 'import' }">
          <NButton class="home-page-heading-button" size="large" type="primary">
            <i18n-t keypath="page.home.heading_try_now" />
          </NButton>
        </router-link>
      </div>

      <div class="home-page-demo-view">
        <DemoBookView />
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
        titleKey="page.home.highlight_color_title"
        descriptionKey="page.home.highlight_color_description"
      >
        <template #image>
          <img v-if="languageType === 'en'" src="/src/assets/intro/en/highlight-color.jpg" alt="Changes" />
          <img v-if="languageType === 'zh'" src="/src/assets/intro/zh-tw/highlight-color.jpg" alt="Changes" />
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

    <div class="home-page-footer">
      <a class="github-link" href="https://github.com/huybn5776/kobo-bookmark" target="_blank">
        <GithubIcon class="github-icon" />
        GitHub
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NButton } from 'naive-ui';

import { GithubIcon } from '@/component/icon';
import { SettingKey } from '@/enum/setting-key';
import DemoBookView from '@/module/home/component/DemoBookView/DemoBookView.vue';
import FeatureIntroductionSection from '@/module/home/component/FeatureIntroductionSection/FeatureIntroductionSection.vue';
import { getSettingFromStorage } from '@/services/setting.service';

const languageType = (getSettingFromStorage(SettingKey.Language) || navigator.language).startsWith('zh') ? 'zh' : 'en';
</script>

<style lang="scss" scoped>
@import './HomePage';
</style>
