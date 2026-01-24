'use client';

import { Card } from '@/components/ui/card';

export const WelcomeCard = () => {
  return (
    <Card className="relative flex min-h-[60vh] flex-col items-center justify-center p-10 text-center overflow-hidden border-violet-500/20 bg-linear-to-br from-violet-500/5 via-transparent to-indigo-500/5">
      <div className="absolute top-0 left-0 w-48 h-48 bg-linear-to-br from-violet-500/10 to-transparent rounded-br-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-linear-to-tl from-indigo-500/10 to-transparent rounded-tl-full pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30">
          <span className="text-white text-3xl">⚔</span>
        </div>
        <h2 className="mb-3 text-2xl font-bold bg-linear-to-r from-violet-200 via-white to-indigo-200 bg-clip-text text-transparent">
          欢迎使用燕云十六声装备毕业率管理器
        </h2>
        <p className="text-violet-300/70 max-w-md">
          请在顶部创建或选择角色后开始录入装备与模拟
        </p>
      </div>
    </Card>
  );
};
