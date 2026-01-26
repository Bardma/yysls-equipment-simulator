'use client';

import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, useLocaleStore } from '@/stores/localeStore';

const locales: { value: Locale; label: string; flag: string }[] = [
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
];

export function LocaleSwitcher() {
  const t = useTranslations('language');
  const { locale, setLocale } = useLocaleStore();

  const currentLocale = locales.find((l) => l.value === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-1.5 text-slate-300 hover:bg-slate-700/30 hover:text-slate-200"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLocale?.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => setLocale(item.value)}
            className={`cursor-pointer gap-2 ${locale === item.value ? 'bg-accent' : ''}`}
          >
            <span>{item.flag}</span>
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
