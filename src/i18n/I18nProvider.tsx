'use client';

import { NextIntlClientProvider } from 'next-intl';

import { useLocaleStore } from '@/stores/localeStore';

import { getMessages } from './index';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { locale } = useLocaleStore();

  const messages = getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
