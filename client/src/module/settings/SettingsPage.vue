<template>
  <div class="page-content settings-page">
    <a :href="notionAuthUrl"><NButton class="connect-to-button" size="large">Connect to Notion</NButton></a>
    <p class="setting-note">
      Please use template page it provided, or select single page you want to export bookmarks.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';
import { AxiosError } from 'axios';
import { useNotification, NButton } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';

import { getNotionTokenByCode } from '@/api/notion-auth-api.service';
import { SettingKey } from '@/enum/setting-key';
import { getNotionExportTargetPageId } from '@/services/notion-export-target.service';
import { saveSettingToStorage } from '@/services/setting.service';

const oauthClientId = import.meta.env.VITE_NOTION_CLIENT_ID;
const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
const route = useRoute();
const router = useRouter();
const notification = useNotification();

onMounted(async () => {
  await getNotionToken();
});

async function getNotionToken(): Promise<void> {
  const { code } = route.query;
  if (typeof code !== 'string') {
    return;
  }
  notification.destroyAll();

  let notionAuth: OauthTokenResponse;
  try {
    notionAuth = await getNotionTokenByCode(code);
  } catch (e) {
    handleAuthError(e);
    return;
  }

  saveSettingToStorage(SettingKey.NotionAuth, notionAuth);
  await router.push('notion');

  const exportTargetPageId = await getNotionExportTargetPageId(notionAuth);
  if (!exportTargetPageId) {
    notification.error({
      title: 'Invalid Notion page',
      content: `Please select to 'Use a template' from install Notion integration page, or select one page to share with Kobo Bookmark integration.`,
      duration: 0,
      closable: true,
    });
    return;
  }

  saveSettingToStorage(SettingKey.NotionExportTargetPageId, exportTargetPageId);
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
</script>

<style lang="scss" scoped>
@import './SettingsPage';
</style>
