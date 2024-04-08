import { Ref, ref, watch, UnwrapRef, toRaw } from 'vue';

import equal from 'fast-deep-equal';
import { isNil } from 'ramda';

import { useMitt } from '@/composition/use-mitt';
import { SettingEventType } from '@/enum/setting-event-type';
import { SettingKey, SettingValueType } from '@/enum/setting-key';
import { getSettingFromStorage, saveOrDelete } from '@/services/setting.service';

export function useSyncSetting<K extends SettingKey, T extends SettingValueType[K]>(
  key: K,
  defaultValue?: T,
): Ref<UnwrapRef<T | undefined>> {
  const settingValue = getSettingFromStorage<K, T>(key) || defaultValue;
  const settingRef = ref(isNil(settingValue) ? undefined : settingValue);
  watchWithEvent(
    key,
    settingRef,
    (value) => saveOrDelete(key, value as T, SettingEventType.User),
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

  watchWithEvent(
    key,
    settingRef,
    (value) => saveOrDelete<K, T>(key, value as unknown as T, SettingEventType.User),
    map,
  );
  return settingRef;
}

function watchWithEvent<K extends SettingKey, T extends SettingValueType[K], N>(
  key: SettingKey,
  settingRef: Ref<T | null | undefined>,
  callback: (value: T | null | undefined) => void,
  map?: (value: T | N) => T | N,
): void {
  let lastValue: T | null | undefined = toRaw(settingRef.value);
  let pauseEvent = false;

  watch(settingRef, () => {
    const newValue = toRaw(settingRef.value);
    if (equal(newValue, lastValue)) {
      return;
    }
    lastValue = (map ? map(newValue as T) : newValue) as T;
    pauseEvent = true;
    callback(lastValue);
    pauseEvent = false;
  });
  const { onEvent } = useMitt();
  onEvent(key, (event) => {
    const { value } = event;
    const newValue = (map ? map(value as T) : value) as T;
    if (equal(newValue, lastValue) || pauseEvent) {
      return;
    }
    lastValue = newValue;
    // eslint-disable-next-line
    settingRef.value = newValue;
  });
}
