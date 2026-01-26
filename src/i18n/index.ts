import type { Locale } from '@/stores/localeStore';

import en from './messages/en.json';
import zh from './messages/zh.json';

export const messages = {
  zh,
  en,
} as const;

export type Messages = typeof zh;

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
