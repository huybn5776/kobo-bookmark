<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.text_export.title" />
    </h3>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.text_export.export_mode" />
      </p>

      <NRadioGroup v-model:value="textExportMode" class="setting-vertical-radio-group">
        <NRadio :value="TextExportMode.List">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.text_export.mode_list" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.text_export.mode_list_description" />
          </p>
        </NRadio>
        <NRadio :value="TextExportMode.Paragraph">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.text_export.mode_paragraph" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.text_export.mode_paragraph_description" />
          </p>
        </NRadio>
      </NRadioGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NRadioGroup, NRadio } from 'naive-ui';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { SettingKey } from '@/enum/setting-key';
import { TextExportMode } from '@/enum/text-export-mode';

const textExportMode = useSyncSetting(SettingKey.TextExportMode, TextExportMode.Paragraph);
</script>

<style lang="scss" scoped>
@forward '../settings';
</style>
