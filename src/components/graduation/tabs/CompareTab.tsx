'use client';

import Image from 'next/image';

import { Checkbox } from '@/components/ui/checkbox';
import { ClassConfig } from '@/lib/data/classConfig';
import { calcRate, mockChengyin } from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';

interface CompareTabProps {
  db: EquipItem[];
  equippedItems: EquippedItems;
  selectedSlotKey: keyof EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  currentRate: number;
  assumeChengyin: boolean;
  freezeDingyin: boolean;
  onAssumeChange: (value: boolean) => void;
  onFreezeChange: (value: boolean) => void;
}

export const CompareTab = ({
  db,
  equippedItems,
  selectedSlotKey,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  currentRate,
  assumeChengyin,
  freezeDingyin,
  onAssumeChange,
  onFreezeChange,
}: CompareTabProps) => {
  // Calculate candidates
  const slotId =
    selectedSlotKey === 'weapon1' || selectedSlotKey === 'weapon2'
      ? '1'
      : selectedSlotKey === 'ring'
        ? '3'
        : selectedSlotKey === 'pendant'
          ? '4'
          : selectedSlotKey === 'head'
            ? '5'
            : selectedSlotKey === 'chest'
              ? '6'
              : selectedSlotKey === 'legs'
                ? '7'
                : '8';

  let candidates = db.filter((equip) => equip.slotId === slotId);
  const currentItem = equippedItems[selectedSlotKey];

  if (slotId === '1') {
    if (currentItem) {
      candidates = candidates.filter((equip) => equip.weaponTypeId === currentItem.weaponTypeId);
    } else {
      const allowed = ClassConfig.WEAPON_RULES[currentClass] || [];
      candidates = candidates.filter((equip) => allowed.includes(equip.weaponTypeId || ''));
    }
  }

  if (currentItem) {
    candidates = candidates.filter((equip) => equip.id !== currentItem.id);
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={assumeChengyin} onCheckedChange={(v) => onAssumeChange(Boolean(v))} />
            假设满承音
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={freezeDingyin} onCheckedChange={(v) => onFreezeChange(Boolean(v))} />
            冻结当前定音
          </label>
        </div>
        <div className="text-muted-foreground py-10 text-center">
          库中没有符合条件的同类装备可供对比
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={assumeChengyin} onCheckedChange={(v) => onAssumeChange(Boolean(v))} />
          假设满承音
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={freezeDingyin} onCheckedChange={(v) => onFreezeChange(Boolean(v))} />
          冻结当前定音
        </label>
      </div>
      <div className="space-y-3">
        {candidates.map((equip) => {
          const testEquip = JSON.parse(JSON.stringify(equip)) as EquipItem;
          if (assumeChengyin) mockChengyin(testEquip);
          if (freezeDingyin) testEquip.dingyinStat = currentItem?.dingyinStat || null;

          const testLoadout = { ...equippedItems, [selectedSlotKey]: testEquip };
          const res = calcRate(
            testLoadout,
            currentClass,
            bowType,
            xinfaLoadout,
            setType,
            earlySeasonBonus
          );
          const newRate = parseFloat(res.graduationRate);
          const diff = newRate - currentRate;
          const diffColor =
            diff > 0.0001
              ? 'text-red-400'
              : diff < -0.0001
                ? 'text-green-400'
                : 'text-muted-foreground';
          const diffSign = diff > 0.0001 ? '+' : '';

          return (
            <div
              key={equip.id}
              className="border-border/60 bg-card space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={`/${equip.icon}`}
                  alt={equip.name}
                  width={48}
                  height={48}
                  className="rounded-md border"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {equip.name}
                    {assumeChengyin ? ' (拟)' : ''}
                  </div>
                  <div className="text-muted-foreground text-xs">毕业率: {newRate.toFixed(2)}%</div>
                </div>
                <div className={`text-sm font-semibold ${diffColor}`}>
                  {diffSign}
                  {diff.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
