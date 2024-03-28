<template>
  <div class="page-content settings-page">
    <h1 class="setting-page-title">
      <i18n-t keypath="page.settings.title" />
    </h1>

    <TextExportSettingsSection />
    <MarkdownSettingsSection />
    <NotionSettingsSection />
  </div>
</template>

<script lang="ts" setup>
import MarkdownSettingsSection from '@/module/settings/component/MarkdownSettingsSection/MarkdownSettingsSection.vue';
import NotionSettingsSection from '@/module/settings/component/NotionSettingsSection/NotionSettingsSection.vue';
import TextExportSettingsSection from '@/module/settings/component/TextExportSettingsSection/TextExportSettingsSection.vue';
</script>

<style lang="scss" scoped>
@import './SettingsPage';
</style>
