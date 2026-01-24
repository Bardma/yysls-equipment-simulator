import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "燕云十六声装备毕业率管理器",
  description: "燕云十六声装备管理、毕业率计算、穿戴模拟工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
