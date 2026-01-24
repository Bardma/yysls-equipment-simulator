'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CharacterSelector } from './CharacterSelector';
import { NewCharacterModal } from '@/components/modals/NewCharacterModal';
import { ImportExportModal } from '@/components/modals/ImportExportModal';

export function Header() {
  const [showNewCharModal, setShowNewCharModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 max-w-screen-2xl mx-auto">
        <h1 className="text-lg font-bold text-foreground whitespace-nowrap shrink-0">
          燕云十六声装备毕业率管理器
        </h1>

        <div className="flex items-center gap-3 ml-4">
          <CharacterSelector />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewCharModal(true)}
            className="whitespace-nowrap"
          >
            + 新建角色
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportExportModal(true)}
            className="whitespace-nowrap"
          >
            导出/导入数据
          </Button>
        </div>
      </div>

      <NewCharacterModal
        open={showNewCharModal}
        onOpenChange={setShowNewCharModal}
      />

      <ImportExportModal
        open={showImportExportModal}
        onOpenChange={setShowImportExportModal}
      />
    </header>
  );
}
