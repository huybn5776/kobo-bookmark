<template>
  <div class="page-content notion-page">
    <a :href="notionAuthUrl">Connect to Notion</a>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

import type { OauthTokenResponse } from '@notionhq/client/build/src/api-endpoints';
import { AxiosError } from 'axios';
import { useNotification } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';

import { getNotionTokenByCode } from '@/api/notion-auth-api.service';
import { SettingKey } from '@/enum/setting-key';
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
@import './NotionPage';
</style>
