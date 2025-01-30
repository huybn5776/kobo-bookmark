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
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const settingValue = (getSettingFromStorage<K>(key) || defaultValue) as T;

  const settingRef = ref<T | undefined>(isNil(settingValue) ? undefined : settingValue) as Ref<
    UnwrapRef<T | undefined>
  >;
  watchWithEvent(
    key,
    settingRef,
    (value) => saveOrDelete(key, value as T, SettingEventType.User),
    (value) => (value === undefined ? null : (value as T)),
  );
  return settingRef;
}

function watchWithEvent<T extends SettingValueType[SettingKey], N>(
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
    lastValue = (map ? map(newValue!) : newValue) as T;
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
    // eslint-disable-next-line no-param-reassign
    settingRef.value = newValue;
  });
}
