import mitt from 'mitt';

import { SettingEventType } from '@/enum/setting-event-type';
import { SettingValueType, SettingKey } from '@/enum/setting-key';

type WrapSettingKey<T extends SettingValueType> = {
  [K in keyof SettingValueType]: { type: SettingEventType; key: SettingKey; value: T[K] | null | undefined };
};
export type SettingKeyEvent = WrapSettingKey<SettingValueType>;

export type EventTypes = SettingKeyEvent;
export const emitter = mitt<EventTypes>();
