import type { Metadata } from 'next';

import { I18nProvider } from '@/i18n/I18nProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Where Winds MeetEquipmentGraduation RateGuanLiQi',
  description: 'Where Winds MeetEquipmentGuanLi、Graduation RateJiSuan、SimulationGongJu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" suppressHydrationWarning>
      <body className="bg-background min-h-screen font-sans antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
