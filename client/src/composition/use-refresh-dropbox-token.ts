import { ref } from 'vue';

import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

import { I18NMessageSchema } from '@/config/i18n-config';
import { SettingEventType } from '@/enum/setting-event-type';
import { SettingKey } from '@/enum/setting-key';
import { refreshDropboxTokenIfNeeded } from '@/services/dropbox/dropbox.service';
import { deleteSettingFromStorage } from '@/services/setting.service';

export function useRefreshDropboxToken(): { refreshDropboxToken: () => boolean } {
  const { t } = useI18n<[I18NMessageSchema]>();
  const message = useMessage();
  const tokenChecked = ref<boolean>(false);

  function refreshDropboxToken(): boolean {
    if (tokenChecked.value) {
      return true;
    }
    try {
      refreshDropboxTokenIfNeeded();
    } catch (e) {
      message.error(t('common.re_connect_to_dropbox_notice'), { duration: 10000 });
      deleteSettingFromStorage(SettingKey.DropboxToken, SettingEventType.Sync);
      return false;
    }
    tokenChecked.value = true;
    return true;
  }

  return { refreshDropboxToken };
}
