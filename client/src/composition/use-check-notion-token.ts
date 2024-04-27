import { useBrowserLocation } from '@vueuse/core';
import { useDialog } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { SettingKey } from '@/enum/setting-key';
import { getSettingFromStorage } from '@/services/setting.service';
import { focusLastButtonOfDialog } from '@/util/dialog-utils';

export function useCheckNotionToken(): {
  redirectToNotionIntegratePage: () => void;
  checkIsNotionReady: () => boolean;
  isNotionIntegrationReady: () => boolean;
} {
  const { t } = useI18n<[I18NMessageSchema]>();
  const dialog = useDialog();
  const location = useBrowserLocation();

  function checkIsNotionReady(): boolean {
    if (isNotionIntegrationReady()) {
      return true;
    }

    let noticeShowed = false;
    const dialogReactive = dialog.info({
      title: t('common.notion_required'),
      content: t('common.notion_required_set_notice'),
      negativeText: t('common.cancel'),
      positiveText: t('common.yes'),
      onPositiveClick: () => {
        if (!noticeShowed) {
          dialogReactive.content = t('page.settings.notion.notion_connect_description');
          noticeShowed = true;
          return false;
        }
        redirectToNotionIntegratePage();
        return true;
      },
      onAfterEnter: focusLastButtonOfDialog,
    });
    return false;
  }

  function isNotionIntegrationReady(): boolean {
    return !!getSettingFromStorage(SettingKey.NotionAuth)?.access_token;
  }

  function redirectToNotionIntegratePage(): void {
    const oauthClientId = import.meta.env.VITE_NOTION_CLIENT_ID;
    const redirectUri = `${location.value.origin}/settings/notion`;
    location.value.href = `https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  return { checkIsNotionReady, isNotionIntegrationReady, redirectToNotionIntegratePage };
}
