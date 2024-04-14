<template>
  <div class="setting-section">
    <h3 class="setting-section-title">
      <i18n-t keypath="page.settings.notion.title" />
    </h3>

    <div v-if="notionAuth" class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.notion.export_to" />
      </p>
      <NRadioGroup v-model:value="exportTo" class="setting-vertical-radio-group">
        <NRadio :value="NotionExportToType.Page">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.notion.export_to_page" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.notion.export_to_page_description" />
          </p>
        </NRadio>
        <NRadio :value="NotionExportToType.Database">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.notion.export_to_database" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.notion.export_to_database_description" />
          </p>
        </NRadio>
        <NRadio :value="NotionExportToType.Auto">
          <span class="setting-vertical-radio-label">
            <i18n-t keypath="page.settings.notion.export_to_auto" />
          </span>
          <p class="setting-vertical-radio-description">
            <i18n-t keypath="page.settings.notion.export_to_auto_description" />
          </p>
        </NRadio>
      </NRadioGroup>
    </div>

    <div v-if="notionAuth" class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.notion.connected_page" />
      </p>
      <NotionConnectedPageSelect
        v-model:id="exportPageId"
        v-model:title="exportPageTitle"
        :optionsGetter="getNotionPageOptions"
        :disabled="!authReady || loadingExportTargetPage"
        :loading="loadingToken || loadingExportTargetPage"
        :placeholder="pageAndDatabaseSelectPlaceholder"
      />
    </div>

    <div v-if="notionAuth" class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.notion.connected_database" />
      </p>
      <NotionConnectedPageSelect
        v-model:id="exportDatabaseId"
        v-model:title="exportDatabaseTitle"
        :optionsGetter="getNotionDatabaseOptions"
        :disabled="!authReady || loadingExportTargetDatabase"
        :loading="loadingToken || loadingExportTargetDatabase"
        :placeholder="pageAndDatabaseSelectPlaceholder"
      />
    </div>

    <div class="setting-row">
      <p class="setting-row-title">
        <i18n-t keypath="page.settings.notion.integration_connect" />
      </p>
      <template v-if="!notionAuth">
        <p class="setting-note">
          <i18n-t keypath="page.settings.notion.notion_connect_description" />
        </p>
        <a :href="authUrl">
          <NButton><i18n-t keypath="page.settings.notion.connect_to_notion" /></NButton>
        </a>
      </template>
      <template v-if="notionAuth">
        <p class="setting-label">
          <i18n-t keypath="page.settings.notion.connected_workspace" />: {{ notionAuth.workspace_name }}
        </p>
        <NButton v-if="notionAuth" :onClick="clearNotionConnection">
          <i18n-t keypath="page.settings.notion.clear_notion_connection" />
        </NButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue';

import type { OauthTokenResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { useBrowserLocation } from '@vueuse/core';
import { AxiosError } from 'axios';
import { useNotification, NButton, SelectOption, NRadioGroup, NRadio } from 'naive-ui';
import { sortBy } from 'ramda';
import { useRoute, useRouter } from 'vue-router';

import { getNotionTokenByCode } from '@/api/notion-auth-api.service';
import { searchDatabase } from '@/api/notion-database-api.service';
import { searchPages } from '@/api/notion-page-api.service';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { NotionExportToType } from '@/enum/notion-export-to-type';
import { SettingKey } from '@/enum/setting-key';
import NotionConnectedPageSelect from '@/module/settings/component/NotionConnectedPageSelect/NotionConnectedPageSelect.vue';
import { getTitleOfDatabase } from '@/services/notion/notion-database.service';
import {
  findNotionTemplatePage,
  findNotionExportTargetPageFromAuth,
  findFirstLibraryDatabase,
  isLibraryDatabase,
} from '@/services/notion/notion-export-target.service';
import { getTitleOfPage } from '@/services/notion/notion-page.service';

const location = useBrowserLocation();
const oauthClientId = import.meta.env.VITE_NOTION_CLIENT_ID;
const redirectUri = `${location.value.origin}/settings/notion`;
const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
const route = useRoute();
const router = useRouter();
const notification = useNotification();

const loadingToken = ref(false);
const loadingExportTargetPage = ref(false);
const loadingExportTargetDatabase = ref(false);

const notionAuth = useSyncSetting(SettingKey.NotionAuth);
const exportTo = useSyncSetting(SettingKey.NotionExportTo, NotionExportToType.Auto);
const exportPageId = useSyncSetting(SettingKey.NotionExportTargetPageId);
const exportPageTitle = useSyncSetting(SettingKey.NotionExportTargetPageTitle);
const exportDatabaseId = useSyncSetting(SettingKey.NotionExportTargetDatabaseId);
const exportDatabaseTitle = useSyncSetting(SettingKey.NotionExportTargetDatabaseTitle);

const pageAndDatabaseSelectPlaceholder = computed(() =>
  notionAuth.value ? undefined : 'Please connect to Notion first',
);
const authReady = computed(() => notionAuth.value || !loadingToken.value);

onMounted(async () => {
  await getNotionToken();
});

async function getNotionToken(): Promise<void> {
  if (route.matched?.[0]?.path !== '/settings/notion') {
    return;
  }
  const { code } = route.query;
  if (typeof code !== 'string') {
    await router.push({ name: 'settings', force: true });
    return;
  }
  notification.destroyAll();

  loadingToken.value = true;
  try {
    notionAuth.value = await getNotionTokenByCode(code, redirectUri);
  } catch (e) {
    handleAuthError(e);
    return;
  } finally {
    loadingToken.value = false;
    await router.push({ name: 'settings', force: true });
  }

  await Promise.all([autoDetectPage(notionAuth.value), autoDetectDatabase()]);
}

async function autoDetectPage(auth: OauthTokenResponse): Promise<void> {
  loadingExportTargetPage.value = true;
  const page = await findNotionExportTargetPageFromAuth(auth);
  if (page) {
    exportPageId.value = page.id;
    exportPageTitle.value = getTitleOfPage(page);
  }
  loadingExportTargetPage.value = false;
}

async function autoDetectDatabase(): Promise<void> {
  loadingExportTargetDatabase.value = true;
  const database = await findFirstLibraryDatabase();
  if (database) {
    exportDatabaseId.value = database.id;
    exportDatabaseTitle.value = getTitleOfDatabase(database);
  }
  loadingExportTargetDatabase.value = false;
}

function handleAuthError(e: unknown): void {
  console.error(e);

  const error = e as AxiosError;
  const responseData = error.response?.data as { error: string; message: string } | undefined;
  notification.error({
    title: `Fail to integrate with Notion`,
    content: responseData?.message,
    duration: 0,
    closable: true,
  });
}

async function getNotionPageOptions(): Promise<SelectOption[]> {
  let pages = (await searchPages()).results as PageObjectResponse[];
  const possiblePage = findNotionTemplatePage(pages);
  if (possiblePage) {
    pages = sortBy((page) => page.id !== possiblePage.id, pages);
  }
  return pages.flatMap((page) => {
    const title = page.properties.title?.type === 'title' ? page.properties.title.title[0].plain_text : '';
    return title ? [{ value: page.id, label: title }] : [];
  });
}

async function getNotionDatabaseOptions(): Promise<SelectOption[]> {
  let databases = (await searchDatabase()).results;
  const possibleDatabase = databases.find(isLibraryDatabase);
  if (possibleDatabase) {
    databases = sortBy((database) => database.id !== possibleDatabase.id, databases);
  }
  return databases.map((database) => {
    const title = database.title[0].plain_text;
    return { value: database.id, label: title };
  });
}

function clearNotionConnection(): void {
  notionAuth.value = undefined;
  exportTo.value = undefined;
  exportPageId.value = undefined;
  exportPageTitle.value = undefined;
  exportDatabaseId.value = undefined;
  exportDatabaseTitle.value = undefined;
}
</script>

<style lang="scss" scoped>
@import '../settings';
</style>
