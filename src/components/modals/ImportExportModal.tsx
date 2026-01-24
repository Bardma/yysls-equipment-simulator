'use client';

import { useState, useRef } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useSimulationStore } from '@/stores/simulationStore';
import { ExportData } from '@/types';
import { APP_VERSION } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportExportModal({ open, onOpenChange }: ImportExportModalProps) {
  const [dataContent, setDataContent] = useState('');
  const [showImportWarning, setShowImportWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getCurrentCharacter, currentCharacterId } = useCharacterStore();
  const { getEquipmentsByCharacter, importEquipments } = useEquipmentStore();
  const { getConfig, importConfig } = useSimulationStore();

  const currentCharacter = getCurrentCharacter();

  const handleExport = () => {
    if (!currentCharacter || !currentCharacterId) return;

    const exportData: ExportData = {
      version: APP_VERSION,
      exportTime: Date.now(),
      character: currentCharacter,
      equipments: getEquipmentsByCharacter(currentCharacterId),
      simulationConfig: getConfig(currentCharacterId),
    };

    setDataContent(JSON.stringify(exportData, null, 2));
  };

  const handleDownload = () => {
    if (!dataContent || !currentCharacter) return;

    const blob = new Blob([dataContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter.name}_装备数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setDataContent(content);
      setShowImportWarning(true);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDataContent(text);
      setShowImportWarning(true);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleConfirmImport = () => {
    if (!currentCharacterId || !dataContent) return;

    try {
      const data: ExportData = JSON.parse(dataContent);

      // 导入装备
      if (data.equipments) {
        importEquipments(currentCharacterId, data.equipments);
      }

      // 导入配置
      if (data.simulationConfig) {
        importConfig(currentCharacterId, data.simulationConfig);
      }

      setShowImportWarning(false);
      setDataContent('');
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to parse import data:', err);
      alert('数据格式错误，请检查导入的数据是否正确');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>导出/导入数据</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={!currentCharacterId}
            >
              导出数据
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!dataContent}
            >
              下载为文件
            </Button>
            <Label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" asChild>
                <span>上传文件导入</span>
              </Button>
            </Label>
            <Button variant="outline" onClick={handlePasteImport}>
              粘贴导入
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>数据内容：</Label>
            <textarea
              className="w-full h-48 p-3 text-sm bg-muted rounded-md border border-border resize-none font-mono"
              placeholder="点击导出数据按钮生成数据，或粘贴/上传数据文件进行导入"
              value={dataContent}
              onChange={(e) => setDataContent(e.target.value)}
            />
          </div>

          {showImportWarning && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md space-y-3">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <span>⚠️ 警告</span>
              </div>
              <p className="text-sm text-muted-foreground">
                导入数据将完全覆盖当前角色（{currentCharacter?.name}）的所有装备数据！
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleConfirmImport}>
                  确认导入
                </Button>
                <Button variant="outline" onClick={() => setShowImportWarning(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
