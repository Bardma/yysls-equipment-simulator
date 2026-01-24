'use client';

import { useState } from 'react';

import {
  decryptData,
  encryptData,
  normalizeLegacyEquipData,
  optimizeEquipData,
  restoreEquipData,
} from '../../lib/importExport';
import type { EquipItem } from '../../lib/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

interface ImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountName: string | null;
  equipData: EquipItem[];
  onImport: (equipData: EquipItem[]) => void;
}

export const ImportExportModal = ({
  open,
  onOpenChange,
  accountName,
  equipData,
  onImport,
}: ImportExportModalProps) => {
  const [text, setText] = useState('');
  const [warningVisible, setWarningVisible] = useState(false);

  const handleExport = () => {
    if (!accountName) return;
    const exportData = {
      version: '1.1',
      accountName,
      timestamp: new Date().toISOString(),
      equipData: optimizeEquipData(equipData),
    };
    const encrypted = encryptData(exportData);
    if (!encrypted) {
      alert('导出数据失败，请重试');
      return;
    }
    setText(encrypted);
    setWarningVisible(false);
  };

  const handleDownload = () => {
    if (!accountName || !text.trim()) return;
    const blob = new Blob([text.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${accountName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCheckImport = () => {
    if (!text.trim()) {
      alert('请输入或粘贴要导入的数据');
      return;
    }
    const decrypted = decryptData(text.trim());
    if (!decrypted || !decrypted.accountName) {
      alert('数据格式错误，请确认这是正确的导出数据');
      return;
    }
    setWarningVisible(true);
  };

  const handleConfirmImport = () => {
    if (!text.trim()) return;
    const decrypted = decryptData(text.trim());
    if (!decrypted || !decrypted.equipData) {
      alert('数据格式错误，导入失败');
      return;
    }
    let data: EquipItem[] = decrypted.equipData;
    if (decrypted.version && parseFloat(decrypted.version) >= 1.1) {
      data = data.map(restoreEquipData);
    } else {
      data = data.map((equip) => normalizeLegacyEquipData(equip));
    }
    onImport(data);
    setWarningVisible(false);
    setText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>导出/导入数据</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleExport} disabled={!accountName}>
              导出数据
            </Button>
            <Button variant="secondary" onClick={handleDownload} disabled={!text.trim()}>
              下载为文件
            </Button>
            <Button variant="outline" onClick={handleCheckImport} disabled={!text.trim()}>
              粘贴导入
            </Button>
          </div>
          <Textarea
            rows={8}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="导出数据或粘贴导入数据"
          />
          {warningVisible && (
            <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-3 text-sm">
              <div className="text-destructive font-medium">⚠️ 警告</div>
              <div className="text-muted-foreground mt-1">
                导入数据将完全覆盖当前角色（{accountName || '当前角色'}）的所有装备数据！
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="destructive" onClick={handleConfirmImport}>
                  确认导入
                </Button>
                <Button variant="secondary" onClick={() => setWarningVisible(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
