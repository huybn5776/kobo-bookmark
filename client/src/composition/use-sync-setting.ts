import { Ref, ref, watch, UnwrapRef, toRaw } from 'vue';

import { isNil } from 'ramda';

import { SettingKey, SettingValueType } from '@/enum/setting-key';
import { getSettingFromStorage, saveOrDelete } from '@/services/setting.service';

export function useSyncSetting<K extends SettingKey, T extends SettingValueType[K]>(
  key: K,
  defaultValue?: T,
): Ref<UnwrapRef<T | undefined>> {
  const settingValue = getSettingFromStorage<K, T>(key) || defaultValue;
  const settingRef = ref(isNil(settingValue) ? undefined : settingValue);
  watchWithEvent(
    settingRef,
    (value) => saveOrDelete(key, value as T),
    (value) => (value === undefined ? null : (value as T)),
  );
  return settingRef;
}

export function useSyncSettingMapNullArray<
  K extends SettingValueType[K] extends Array<unknown> ? SettingKey : never,
  T extends SettingValueType[K] extends Array<unknown> ? SettingValueType[K] : never,
  V extends T,
  RT extends V extends never ? T | undefined : V,
>(key: K, map?: (value: T | V | UnwrapRef<RT> | undefined) => T | V, defaultValue?: T): Ref<UnwrapRef<RT>> {
  let settingValue = getSettingFromStorage<K, T>(key) || defaultValue;
  settingValue = isNil(settingValue === null) ? ([] as Array<unknown> as T & Array<unknown>) : settingValue;

  const refValue = (map ? map(settingValue) : settingValue) as unknown as RT;
  const settingRef = ref<RT>(refValue);

  watchWithEvent(settingRef, (value) => saveOrDelete<K, T>(key, value as unknown as T), map);
  return settingRef;
}

function watchWithEvent<K extends SettingKey, T extends SettingValueType[K], N>(
  settingRef: Ref<T | null | undefined>,
  callback: (value: T | null | undefined) => void,
  map?: (value: T | N) => T | N,
): void {
  watch(settingRef, () => {
    let newValue = toRaw(settingRef.value);
    newValue = (map ? map(newValue as T) : newValue) as T;
    callback(newValue);
  });
}
