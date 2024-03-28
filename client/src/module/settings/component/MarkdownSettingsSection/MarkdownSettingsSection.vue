<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.markdown.title" />
    </h3>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.markdown.export_mode" />
      </p>

      <NRadioGroup v-model:value="markdownExportMode" class="setting-vertical-radio-group">
        <NRadio :value="MarkdownExportMode.List">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.markdown.mode_list" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.markdown.mode_list_description" />
          </p>
        </NRadio>
        <NRadio :value="MarkdownExportMode.Paragraph">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.markdown.mode_paragraph" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.markdown.mode_paragraph_description" />
          </p>
        </NRadio>
      </NRadioGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NRadioGroup, NRadio } from 'naive-ui';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { MarkdownExportMode } from '@/enum/markdown-export-mode';
import { SettingKey } from '@/enum/setting-key';

const markdownExportMode = useSyncSetting(SettingKey.MarkdownExportMode, MarkdownExportMode.Paragraph);
</script>

<style lang="scss" scoped>
@import '../settings';
</style>
