'use client';

import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';

export const WelcomeCard = () => {
  const t = useTranslations('welcome');

  return (
    <Card className="relative flex min-h-[50vh] sm:min-h-[60vh] flex-col items-center justify-center p-6 sm:p-10 text-center overflow-hidden border-violet-500/20 bg-linear-to-br from-violet-500/5 via-transparent to-indigo-500/5">
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-linear-to-br from-violet-500/10 to-transparent rounded-br-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-linear-to-tl from-indigo-500/10 to-transparent rounded-tl-full pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
          <span className="text-white text-2xl sm:text-3xl">⚔</span>
        </div>
        <h2 className="mb-2 sm:mb-3 text-lg sm:text-2xl font-bold bg-linear-to-r from-violet-200 via-white to-indigo-200 bg-clip-text text-transparent">
          {t('title')}
        </h2>
        <p className="text-violet-300/70 max-w-md text-sm sm:text-base px-2">
          {t('description')}
        </p>
      </div>
    </Card>
  );
};
