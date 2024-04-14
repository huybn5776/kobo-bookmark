<template>
  <p class="dropbox-connection-state">
    <i18n-t keypath="common.state" />:
    <span v-if="loading"><i18n-t keypath="common.loading" /></span>
    <span v-if="!loading">{{ dropboxState }}</span>
  </p>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { DropboxTokenInfo } from '@/interface/dropbox-token-info';

const props = defineProps<{ dropboxToken: DropboxTokenInfo | undefined; loading?: boolean }>();

const { t } = useI18n<[I18NMessageSchema]>();

const dropboxState = computed(() => {
  if (props.dropboxToken) {
    if (props.dropboxToken.expiresAt > Date.now()) {
      return t('common.connected');
    }
    return t('common.expired');
  }
  return t('common.not_connected');
});
</script>

<style lang="scss" scoped>
@import './DropboxConnectionState';
</style>
