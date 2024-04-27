import { useBrowserLocation } from '@vueuse/core';
import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { SettingKey } from '@/enum/setting-key';
import { createDropboxAuthUrl } from '@/services/dropbox/dropbox.service';
import { getSettingFromStorage } from '@/services/setting.service';
import { focusLastButtonOfDialog } from '@/util/dialog-utils';

export function useCheckDropboxToken(): {
  redirectToDropboxConnectPage: () => void;
  checkIsDropboxReady: () => boolean;
  isDropboxConnectReady: () => boolean;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();
  const location = useBrowserLocation();

  function checkIsDropboxReady(): boolean {
    if (isDropboxConnectReady()) {
      return true;
    }

    dialog.info({
      title: t('common.dropbox_required'),
      content: t('common.dropbox_required_set_notice'),
      negativeText: t('common.cancel'),
      positiveText: t('common.yes'),
      onPositiveClick: () => redirectToDropboxConnectPage(),
      onAfterEnter: focusLastButtonOfDialog,
    });
    return false;
  }

  function isDropboxConnectReady(): boolean {
    return !!getSettingFromStorage(SettingKey.DropboxToken);
  }

  async function redirectToDropboxConnectPage(): Promise<void> {
    const redirectUri = `${location.value.origin}/settings/dropbox`;
    location.value.href = await createDropboxAuthUrl(redirectUri);
  }

  return { checkIsDropboxReady, isDropboxConnectReady, redirectToDropboxConnectPage };
}
