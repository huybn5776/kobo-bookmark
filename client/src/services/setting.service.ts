import { SettingValueType, SettingKey } from '@/enum/setting-key';
import { saveToStorage, getFromStorage } from '@/util/storage-utils';

export function getSettingFromStorage<K extends SettingKey, T extends SettingValueType[K]>(key: K): T | null {
  return getFromStorage<T>(key);
}

export function saveSettingToStorage<K extends SettingKey, T extends SettingValueType[K]>(
  key: K,
  value: T | null | undefined,
): void {
  saveToStorage(key, value);
}
