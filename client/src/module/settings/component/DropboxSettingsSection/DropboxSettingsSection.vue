<template>
  <div class="setting-section">
    <h3>
      <i18n-t keypath="page.settings.dropbox.dropbox_connect" />
    </h3>
    <div class="setting-row setting-button-row">
      <DropboxConnectionState :dropboxToken="dropboxToken" :loading="dropboxTokenLoading" />
      <NButton v-if="!dropboxToken" @click="connectDropbox">
        <i18n-t keypath="page.settings.dropbox.connect_to_dropbox" />
      </NButton>
      <NButton v-if="dropboxToken" @click="clearDropboxToken">
        <i18n-t keypath="page.settings.dropbox.clear_dropbox_setting" />
      </NButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';

import { useBrowserLocation } from '@vueuse/core';
import { NButton } from 'naive-ui';

import { useMitt } from '@/composition/use-mitt';
import { useSyncSetting } from '@/composition/use-sync-setting';
import { SettingKey } from '@/enum/setting-key';
import { DropboxTokenInfo } from '@/interface/dropbox-token-info';
import DropboxConnectionState from '@/module/settings/component/DropboxConnectionState/DropboxConnectionState.vue';
import { useCatchDropboxTokenFromUrl } from '@/module/settings/composition/use-catch-dropbox-token-from-url';
import { createDropboxAuthUrl, refreshDropboxTokenIfNeeded } from '@/services/dropbox/dropbox.service';

const dropboxToken = useSyncSetting(SettingKey.DropboxToken);

const location = useBrowserLocation();
const { unsubscribeAllEvents } = useMitt();
const { loading: loadingDropboxToken } = useCatchDropboxTokenFromUrl(onGotDropboxToken);

const refreshingDropboxToken = ref(false);

const dropboxTokenLoading = computed(() => loadingDropboxToken.value || refreshingDropboxToken.value);

onMounted(async () => {
  if (dropboxToken.value) {
    refreshingDropboxToken.value = true;
    const newTokenInfo = await refreshDropboxTokenIfNeeded();
    refreshingDropboxToken.value = false;
    if (newTokenInfo) {
      dropboxToken.value = newTokenInfo;
    }
  }
});

async function connectDropbox(): Promise<void> {
  const redirectUri = `${location.value.origin}/settings/dropbox`;
  location.value.href = await createDropboxAuthUrl(redirectUri);
}

function onGotDropboxToken(token: DropboxTokenInfo): void {
  dropboxToken.value = token;
}

function clearDropboxToken(): void {
  unsubscribeAllEvents();
  dropboxToken.value = undefined;
}
</script>

<style lang="scss" scoped>
@import '../settings';
</style>
