'use client';

import Image from 'next/image';

import { ClassConfig } from '../../lib/data/classConfig';
import { CommonData } from '../../lib/data/commonData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>选择心法</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {options.map((name) => (
            <button
              key={name}
              className="border-border/60 bg-card hover:border-primary/50 rounded-lg border p-3 text-left transition"
              onClick={() => {
                onSelect(name);
                onOpenChange(false);
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <Image
                  src={`/icon/${name}.jpg`}
                  alt={name}
                  width={64}
                  height={64}
                  className="border-border/60 rounded-md border"
                />
                <span className="text-sm">{name}</span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
