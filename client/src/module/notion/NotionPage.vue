<template>
  <div class="page-content notion-page">
    <a :href="notionAuthUrl">Connect to Notion</a>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

import { useRoute, useRouter } from 'vue-router';

import { getNotionTokenByCode } from '@/api/notion-auth-api.service';
import { SettingKey } from '@/enum/setting-key';
import { saveSettingToStorage } from '@/services/setting.service';

const oauthClientId = import.meta.env.VITE_NOTION_CLIENT_ID;
const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`;
const route = useRoute();
const router = useRouter();

async function getNotionToken(): Promise<string | null> {
  const { code } = route.query;
  if (typeof code !== 'string') {
    return null;
  }

  const notionAuth = await getNotionTokenByCode(code);
  const notionToken = notionAuth.access_token;
  saveSettingToStorage(SettingKey.NotionAuth, notionAuth);

  await router.push('notion');

  return notionToken;
}

onMounted(async () => {
  await getNotionToken();
});
</script>

<style lang="scss" scoped>
@import './NotionPage';
</style>
