<template>
  <div class="page-content settings-page">
    <h1 class="setting-page-title">
      <i18n-t keypath="page.settings.title" />
    </h1>

    <TextExportSettingsSection />
    <MarkdownSettingsSection />
    <NotionSettingsSection />
    <DropboxSettingsSection />
    <MiscSettingsSection />
    <BackupSettingSection />
  </div>
</template>

<script lang="ts" setup>
import BackupSettingSection from '@/module/settings/component/BackupSettingSection/BackupSettingSection.vue';
import DropboxSettingsSection from '@/module/settings/component/DropboxSettingsSection/DropboxSettingsSection.vue';
import MarkdownSettingsSection from '@/module/settings/component/MarkdownSettingsSection/MarkdownSettingsSection.vue';
import MiscSettingsSection from '@/module/settings/component/MiscSettingsSection/MiscSettingsSection.vue';
import NotionSettingsSection from '@/module/settings/component/NotionSettingsSection/NotionSettingsSection.vue';
import TextExportSettingsSection from '@/module/settings/component/TextExportSettingsSection/TextExportSettingsSection.vue';
</script>

<style lang="scss" scoped>
@import './SettingsPage';
</style>
