<template>
  <div class="page-content settings-page">
    <h1 class="setting-page-title">
      <i18n-t keypath="page.settings.title" />
    </h1>

    <NotionSettingsSection />
  </div>
</template>

<script lang="ts" setup>
import NotionSettingsSection from '@/module/settings/component/NotionSettingsSection/NotionSettingsSection.vue';
</script>

<style lang="scss" scoped>
@import './SettingsPage';
</style>
