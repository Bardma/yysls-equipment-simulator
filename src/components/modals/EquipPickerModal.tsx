'use client';

import Image from 'next/image';

import { CommonData } from '../../lib/data/commonData';
import type { EquipItem } from '../../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface EquipPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotId: string;
  weaponTypeId?: string | null;
  db: EquipItem[];
  onSelect: (item: EquipItem) => void;
}

const getScore = (equip: EquipItem) => {
  if (equip.isChengyin) return '94.0%';
  let totalPct = 0;
  let count = 0;
  if (equip.mainStat && equip.mainStat.type !== '生存类词条' && equip.mainStat.type !== '生存向') {
    const mMax = CommonData.MAX_VALUES[equip.mainStat.type];
    if (mMax) {
      totalPct += equip.mainStat.value / mMax;
      count++;
    }
  }
  equip.subStats.forEach((sub) => {
    if (sub.type !== '生存类词条' && sub.type !== '生存向') {
      const sMax = CommonData.MAX_VALUES[sub.type];
      if (sMax) {
        totalPct += sub.value / sMax;
        count++;
      }
    }
  });
  return count > 0 ? `${((totalPct / count) * 100).toFixed(1)}%` : '0.0%';
};

export const EquipPickerModal = ({
  open,
  onOpenChange,
  slotId,
  weaponTypeId,
  db,
  onSelect,
}: EquipPickerModalProps) => {
  const candidates = db.filter((item) => {
    if (item.slotId !== slotId) return false;
    if (slotId === '1' && weaponTypeId) {
      return item.weaponTypeId === weaponTypeId;
    }
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>选择装备</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
          {candidates.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">没有找到符合条件的装备。</div>
          ) : (
            candidates.map((equip) => (
              <button
                key={equip.id}
                className="border-border/60 bg-card hover:border-primary/50 flex w-full items-center gap-3 rounded-lg border p-3 text-left"
                onClick={() => {
                  onSelect(equip);
                  onOpenChange(false);
                }}
              >
                <Image
                  src={`/${equip.icon}`}
                  alt={equip.name}
                  width={48}
                  height={48}
                  className="border-border/60 rounded-md border"
                />
                <div className="flex-1">
                  <div className="font-medium">{equip.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {equip.mainStat.type}+{equip.mainStat.value} | 均值:{' '}
                    <span className="text-yellow-300">{getScore(equip)}</span>
                  </div>
                </div>
                <div className="text-lg text-green-400">+</div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
