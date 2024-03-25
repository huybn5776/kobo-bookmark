import { createI18n, I18nT } from 'vue-i18n';

import { i18nEn } from '@/const/i18n/i18n-en';
import { i18nZhTw } from '@/const/i18n/i18n-zh-tw';

export type I18NMessageSchema = typeof i18nEn;

export const i18nConfig = createI18n<[I18NMessageSchema], 'en' | 'zh-TW'>({
  legacy: false,
  locale: navigator.language,
  messages: {
    en: i18nEn,
    'zh-TW': i18nZhTw,
  },
  fallbackLocale: {
    zh: ['zh-TW'],
    default: ['en'],
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(I18nT as any).props.scope.default = 'global';
