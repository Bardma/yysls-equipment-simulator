import type { Metadata } from 'next';

import { I18nProvider } from '@/i18n/I18nProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'YYSLS Equipment Graduation Rate Manager',
  description: 'YYSLS equipment management, graduation rate calculator, and loadout simulator.',
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
