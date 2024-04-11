<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.misc.title" />
    </h3>

    <SwitchRow v-model:value="showArchived">
      <i18n-t keypath="page.settings.misc.show_archived" />
    </SwitchRow>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.misc.language" />
      </p>
      <LanguageSelect v-model:language="language" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSyncSetting } from '@/composition/use-sync-setting';
import { SettingKey } from '@/enum/setting-key';
import LanguageSelect from '@/module/settings/component/LanguageSelect/LanguageSelect.vue';
import SwitchRow from '@/module/settings/component/SwitchRow/SwitchRow.vue';

const showArchived = useSyncSetting(SettingKey.ShowArchived);
const language = useSyncSetting(SettingKey.Language);
</script>

<style lang="scss" scoped>
@import '../settings';
</style>
