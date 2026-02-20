import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';

import { I18nProvider } from '@/i18n/I18nProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'WWM Divinité Equipment Simulator',
  description: 'Where Winds Meet Divinité equipment planning and simulation tool',
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
        <Analytics />
      </body>
    </html>
  );
}
