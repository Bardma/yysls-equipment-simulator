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
    <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-1 lg:space-y-2 lg:gap-0">
      {SLOT_KEYS.map((key) => {
        const item = equippedItems[key];
        return (
          <button
            key={key}
            className={cn(
              'flex flex-col lg:flex-row w-full items-center gap-1 lg:gap-2 rounded-lg border p-1.5 lg:p-2 text-left',
              selectedSlot === key ? 'border-primary bg-primary/5' : 'border-border/60'
            )}
            onClick={() => onSlotSelect(key)}
          >
            <Image
              src={`/${item?.icon || 'icon/icon1.jpg'}`}
              alt={item?.name || '未穿戴'}
              width={32}
              height={32}
              className="rounded-md border lg:w-10 lg:h-10"
            />
            <div className="flex-1 text-center lg:text-left">
              <div className="text-[10px] lg:text-sm font-medium truncate max-w-full">{item?.name || '未穿戴'}</div>
              <div className="text-muted-foreground text-[9px] lg:text-xs hidden lg:block">{SLOT_NAME_MAP[key]}</div>
            </div>
            {item && (
              <span className="text-muted-foreground text-[9px] lg:text-xs hidden lg:inline">{getEquipScore(item)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export { SLOT_NAME_MAP, SLOT_KEYS };
