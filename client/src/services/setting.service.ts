import { SettingEventType } from '@/enum/setting-event-type';
import { SettingValueType, SettingKey } from '@/enum/setting-key';
import { emitter } from '@/services/emitter-service';
import { isNilOrEmpty, isNotNilOrEmpty } from '@/util/object-utils';
import { saveToStorage, getFromStorage, deleteFromStorage } from '@/util/storage-utils';

export function getSettingFromStorage<K extends SettingKey>(key: K): SettingValueType[K] | null {
  return getFromStorage<SettingValueType[K]>(key);
}

export function saveSettingToStorage<K extends SettingKey>(
  key: K,
  value: SettingValueType[K] | null | undefined,
  type: SettingEventType,
): void {
  saveToStorage(key, value);
  emitter.emit(key, { type, key, value: value as never });
}

export function saveOrDelete<K extends SettingKey>(
  key: K,
  value: SettingValueType[K] | null | undefined,
  type: SettingEventType,
): void {
  if (isNilOrEmpty(value)) {
    deleteSettingFromStorage(key, type);
    return;
  }
  saveSettingToStorage(key, value, type);
}

export function deleteSettingFromStorage(key: SettingKey, type: SettingEventType): void {
  deleteFromStorage(key);
  emitter.emit(key, { type, key, value: null });
}

export function deleteAllSettingFromStorage(type: SettingEventType): void {
  for (const key of Object.values(SettingKey)) {
    deleteSettingFromStorage(key, type);
  }
}

export function getSettingValues(): Partial<SettingValueType> {
  const settingValues: Record<string, unknown> = {};

  for (const key of Object.values(SettingKey)) {
    const value = getSettingFromStorage(key);
    if (isNotNilOrEmpty(value)) {
      settingValues[key] = value;
    }
  }

  return settingValues as Partial<SettingValueType>;
}
