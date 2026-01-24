'use client';

import Image from 'next/image';

import { getEquipScore } from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';
import { cn } from '@/lib/utils';

const SLOT_NAME_MAP: Record<keyof EquippedItems, string> = {
  weapon1: '武器1',
  weapon2: '武器2',
  head: '冠胄',
  chest: '胸甲',
  ring: '环',
  pendant: '佩',
  legs: '胫甲',
  hands: '腕甲',
};

const SLOT_KEYS: Array<keyof EquippedItems> = [
  'weapon1',
  'weapon2',
  'head',
  'chest',
  'ring',
  'pendant',
  'legs',
  'hands',
];

interface EquipSlotSelectorProps {
  equippedItems: EquippedItems;
  selectedSlot: keyof EquippedItems;
  onSlotSelect: (slot: keyof EquippedItems) => void;
}

export const EquipSlotSelector = ({
  equippedItems,
  selectedSlot,
  onSlotSelect,
}: EquipSlotSelectorProps) => {
  return (
    <div className="space-y-2">
      {SLOT_KEYS.map((key) => {
        const item = equippedItems[key];
        return (
          <button
            key={key}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border p-2 text-left',
              selectedSlot === key ? 'border-primary' : 'border-border/60'
            )}
            onClick={() => onSlotSelect(key)}
          >
            <Image
              src={`/${item?.icon || 'icon/icon1.jpg'}`}
              alt={item?.name || '未穿戴'}
              width={40}
              height={40}
              className="rounded-md border"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{item?.name || '未穿戴'}</div>
              <div className="text-muted-foreground text-xs">{SLOT_NAME_MAP[key]}</div>
            </div>
            {item && (
              <span className="text-muted-foreground text-xs">{getEquipScore(item)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export { SLOT_NAME_MAP, SLOT_KEYS };
