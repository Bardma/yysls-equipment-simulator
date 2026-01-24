'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header/Header';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';
import { GraduationDisplay } from '@/components/graduation/GraduationDisplay';
import { useCharacterStore } from '@/stores/characterStore';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { currentCharacterId, characters } = useCharacterStore();
  const hasCharacters = characters.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur h-14" />
        <main className="flex-1 container max-w-screen-2xl mx-auto p-4">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container max-w-screen-2xl mx-auto p-4">
        {!hasCharacters ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                欢迎使用燕云十六声装备毕业率管理器
              </h2>
              <p className="text-muted-foreground">
                请点击右上角 <strong>"+ 新建角色"</strong> 按钮创建新角色
              </p>
            </div>
          </div>
        ) : !currentCharacterId ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4">
              <h2 className="text-xl text-foreground">
                请选择一个角色开始
              </h2>
              <p className="text-muted-foreground">
                在顶部下拉菜单中选择角色，或创建新角色
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧：装备列表 */}
            <div className="lg:col-span-5 xl:col-span-4">
              <EquipmentList />
            </div>

            {/* 右侧：穿戴模拟和毕业率 */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <SimulationPanel />
              <GraduationDisplay />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
