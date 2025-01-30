<template>
  <NCollapse :expandedNames="expandedNames" @update:expandedNames="onExpandedNamesChange">
    <NCollapseItem class="data-import-steps-collapse" name="import-steps">
      <template #header>
        <h3>
          <i18n-t keypath="page.data_import.instruction" />
        </h3>
      </template>
      <ul class="data-import-steps">
        <li>
          <i18n-t keypath="page.data_import.instruction_steps.find_your_file">
            <code>KoboReader.sqlite</code>
          </i18n-t>
        </li>
        <li class="data-import-step-level-2">
          <i18n-t keypath="page.data_import.instruction_steps.find_your_file_kobo_reader_title" />
        </li>
        <li class="data-import-step-level-3">
          <i18n-t keypath="page.data_import.instruction_steps.find_your_file_kobo_reader">
            <code>KoboReader.sqlite</code>
            <code>/.kobo/KoboReader.sqlite</code>
          </i18n-t>
        </li>
        <li class="data-import-step-level-3">
          <i18n-t keypath="page.data_import.instruction_steps.find_your_file_kobo_reader_note" />
        </li>
        <li class="data-import-step-level-2">
          <a href="https://help.kobo.com/hc/articles/360020121953" target="_blank">Kobo desktop</a>
        </li>
        <li class="data-import-step-level-3">
          <i18n-t keypath="page.data_import.instruction_steps.find_your_file_kobo_desktop">
            <code>Kobo.sqlite</code>
          </i18n-t>
        </li>
        <li class="data-import-step-level-3">
          Windows:
          <code>
            <i18n-t keypath="page.data_import.instruction_steps.find_your_file_kobo_desktop_windows" />
          </code>
        </li>
        <li class="data-import-step-level-3">
          MacOS:
          <code>
            <i18n-t keypath="page.data_import.instruction_steps.find_your_file_kobo_desktop_macos" />
          </code>
        </li>
        <li>
          <i18n-t keypath="page.data_import.instruction_steps.website_resolve">
            <a href="https://books.google.com.tw/">Google Books</a>
            <a href="https://www.rakuten.co.jp/">Rakuten mart</a>
          </i18n-t>
        </li>
        <li>
          <i18n-t keypath="page.data_import.instruction_steps.connect_notion">
            <router-link :to="{ name: 'bookmarks' }">
              <i18n-t keypath="page_name.bookmarks" />
            </router-link>
            <router-link :to="{ name: 'settings' }">
              <i18n-t keypath="page_name.settings" />
            </router-link>
          </i18n-t>
        </li>
      </ul>
    </NCollapseItem>
  </NCollapse>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { NCollapse, NCollapseItem } from 'naive-ui';

import { useSyncSetting } from '@/composition/use-sync-setting';
import { SettingKey } from '@/enum/setting-key';

const importDataInstructionCollapsed = useSyncSetting(SettingKey.ImportDataInstructionCollapsed);

const expandedNames = computed(() => (importDataInstructionCollapsed.value ? [] : ['import-steps']));

function onExpandedNamesChange(names: string[]): void {
  importDataInstructionCollapsed.value = !names.some((name) => name === 'import-steps');
}
</script>

<style lang="scss" scoped>
@forward './ImportDataInstruction';
</style>
