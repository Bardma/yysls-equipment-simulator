'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { ClassConfig } from '../../lib/data/classConfig';
import { CommonData } from '../../lib/data/commonData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { xinfaLabel } from '@/lib/statName';

interface XinfaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentClass: string;
  currentLoadout: string[];
  slotIndex: number;
  onSelect: (name: string) => void;
}

export const XinfaModal = ({
  open,
  onOpenChange,
  currentClass,
  currentLoadout,
  slotIndex,
  onSelect,
}: XinfaModalProps) => {
  const t = useTranslations('modal');
  const rules = ClassConfig.XINFA_RULES[currentClass];
  const pool = new Set([
    ...(rules?.default || []),
    ...(rules?.extra || []),
    ...CommonData.GENERIC_XINFA,
  ]);

  const options = CommonData.XINFA_LIST.filter((name) => {
    if (!pool.has(name)) return false;
    if (currentLoadout.includes(name) && currentLoadout[slotIndex] !== name) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !flex-col gap-0 p-0 max-w-3xl max-h-[90vh]">
        <DialogHeader className="shrink-0 border-b border-border/40 px-4 sm:px-6 py-4">
          <DialogTitle className="text-base sm:text-lg">{t('xinfaTitle')}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
            {options.map((name) => (
              <button
                key={name}
                className="border-border/60 bg-card hover:border-primary/50 rounded-lg border p-2 sm:p-3 text-left transition"
                onClick={() => {
                  onSelect(name);
                  onOpenChange(false);
                }}
              >
                <div className="flex flex-col items-center gap-1 sm:gap-2">
                  <Image
                    src={`/icon/${name}.jpg`}
                    alt={xinfaLabel(name)}
                    width={48}
                    height={48}
                    className="border-border/60 rounded-md border sm:w-16 sm:h-16"
                  />
                  <span className="text-xs sm:text-sm text-center">{xinfaLabel(name)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
