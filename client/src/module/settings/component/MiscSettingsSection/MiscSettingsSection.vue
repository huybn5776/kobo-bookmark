<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.misc.title" />
    </h3>

    <SwitchRow v-model:value="showRemovedBooksWhenImporting">
      <i18n-t keypath="page.settings.misc.show_removed_book_when_importing" />
    </SwitchRow>

    <SwitchRow v-model:value="showArchived">
      <i18n-t keypath="page.settings.misc.show_archived" />
    </SwitchRow>

    <SwitchRow v-model:value="keepLastSelectedBookCollection">
      <i18n-t keypath="page.settings.misc.keep_the_last_selected_book_collection_when_opening_bookmarks_page" />
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
import { watch } from 'vue';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { SettingKey } from '@/enum/setting-key';
import LanguageSelect from '@/module/settings/component/LanguageSelect/LanguageSelect.vue';
import SwitchRow from '@/module/settings/component/SwitchRow/SwitchRow.vue';

const showRemovedBooksWhenImporting = useSyncSetting(SettingKey.ShowRemovedBooksWhenImporting);
const showArchived = useSyncSetting(SettingKey.ShowArchived);
const keepLastSelectedBookCollection = useSyncSetting(SettingKey.KeepLastSelectedBookCollection);
const lastSelectedBookCollectionId = useSyncSetting(SettingKey.LastSelectedBookCollectionId);
const language = useSyncSetting(SettingKey.Language);

watch(
  () => keepLastSelectedBookCollection.value,
  () => {
    if (!keepLastSelectedBookCollection.value) {
      lastSelectedBookCollectionId.value = undefined;
    }
  },
);
</script>

<style lang="scss" scoped>
@import '../settings';
</style>
