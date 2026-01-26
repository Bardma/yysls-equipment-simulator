'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('importExport');
  const tCommon = useTranslations('common');
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
      alert(t('exportError'));
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
      alert(t('noDataError'));
      return;
    }
    const decrypted = decryptData(text.trim());
    if (!decrypted || !decrypted.accountName) {
      alert(t('formatError'));
      return;
    }
    setWarningVisible(true);
  };

  const handleConfirmImport = () => {
    if (!text.trim()) return;
    const decrypted = decryptData(text.trim());
    if (!decrypted || !decrypted.equipData) {
      alert(t('importError'));
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
      <DialogContent className="!flex !flex-col gap-0 p-0 max-w-2xl max-h-[90vh]">
        <DialogHeader className="shrink-0 border-b border-border/40 px-4 sm:px-6 py-4">
          <DialogTitle className="text-base sm:text-lg">{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleExport} disabled={!accountName} className="text-xs sm:text-sm">
              {t('exportData')}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDownload} disabled={!text.trim()} className="text-xs sm:text-sm">
              {t('downloadFile')}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCheckImport} disabled={!text.trim()} className="text-xs sm:text-sm">
              {t('pasteImport')}
            </Button>
          </div>
          <Textarea
            rows={6}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('placeholder')}
            className="text-xs sm:text-sm"
          />
          {warningVisible && (
            <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-2 sm:p-3 text-xs sm:text-sm">
              <div className="text-destructive font-medium">⚠️ {t('warning')}</div>
              <div className="text-muted-foreground mt-1">
                {t('overwriteWarning', { account: accountName || t('currentCharacter') })}
              </div>
              <div className="mt-2 sm:mt-3 flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleConfirmImport} className="text-xs sm:text-sm">
                  {t('confirmImport')}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setWarningVisible(false)} className="text-xs sm:text-sm">
                  {tCommon('cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="shrink-0 border-t border-border/40 px-4 sm:px-6 py-4">
          <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)} className="text-xs sm:text-sm">
            {tCommon('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
