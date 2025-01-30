import { onMounted, ref, Ref } from 'vue';

import { useBrowserLocation } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { I18NMessageSchema } from '@/config/i18n-config';
import { DropboxTokenInfo } from '@/interface/dropbox-token-info';
import { getDropboxTokenFromAuthCode, setTokenIntoDropboxAuth } from '@/services/dropbox/dropbox.service';

export function useCatchDropboxTokenFromUrl(onToken: (token: DropboxTokenInfo) => void): { loading: Ref<boolean> } {
  const { t } = useI18n<[I18NMessageSchema]>();
  const location = useBrowserLocation();
  const route = useRoute();
  const router = useRouter();
  const message = useMessage();
  const loading = ref(false);

  onMounted(async () => {
    if (route.matched?.[0]?.path !== '/settings/dropbox') {
      return;
    }
    const authCode = route.query.code as string;
    if (!authCode) {
      await router.push({ name: 'settings', force: true });
      return;
    }
    const redirectUri = `${location.value.origin}${route.path}`;

    loading.value = true;
    const tokenInfo = await getDropboxTokenFromAuthCode(redirectUri, authCode);
    loading.value = false;
    if (!tokenInfo) {
      message.error(t('common.dropbox_connect_failed'));
      return;
    }

    setTokenIntoDropboxAuth(tokenInfo);
    await router.push({ name: 'settings', force: true });
    onToken(tokenInfo);
  });

  return { loading };
}
