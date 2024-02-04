import axios from 'axios';

import { SettingKey } from '@/enum/setting-key';
import { getSettingFromStorage } from '@/services/setting.service';

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use((config) => {
  const auth = getSettingFromStorage(SettingKey.NotionAuth);
  const token = auth?.access_token;
  if (token) {
    config.headers.setAuthorization(token ? `Bearer ${token}` : '');
  }
  return config;
});

export default axiosInstance;
