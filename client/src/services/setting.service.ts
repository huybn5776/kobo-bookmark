import { SettingValueType, SettingKey } from '@/enum/setting-key';
import { isNilOrEmpty } from '@/util/object-utils';
import { saveToStorage, getFromStorage, deleteFromStorage } from '@/util/storage-utils';

export function getSettingFromStorage<K extends SettingKey, T extends SettingValueType[K]>(key: K): T | null {
  return getFromStorage<T>(key);
}

export function saveSettingToStorage<K extends SettingKey, T extends SettingValueType[K]>(
  key: K,
  value: T | null | undefined,
): void {
  saveToStorage(key, value);
}

export function saveOrDelete<K extends SettingKey, T extends SettingValueType[K]>(
  key: K,
  value: T | null | undefined,
): void {
  if (isNilOrEmpty(value)) {
    deleteSettingFromStorage(key);
    return;
  }
  saveSettingToStorage(key, value);
}

export function deleteSettingFromStorage(key: SettingKey): void {
  deleteFromStorage(key);
}
