'use client';

import Image from 'next/image';

import { Card } from '@/components/ui/card';
import type { EquipItem, EquippedItems } from '@/lib/types';

const SLOT_LABELS: Record<keyof EquippedItems, string> = {
  weapon1: '武器1',
  weapon2: '武器2',
  head: '冠胄',
  chest: '胸甲',
  ring: '环',
  pendant: '佩',
  legs: '胫甲',
  hands: '腕甲',
};

interface EquipmentSlotProps {
  slotKey: keyof EquippedItems;
  item: EquipItem | null;
  onClick?: () => void;
  onUnequip?: (slotKey: keyof EquippedItems) => void;
}

export const EquipmentSlot = ({ slotKey, item, onClick, onUnequip }: EquipmentSlotProps) => {
  const label = SLOT_LABELS[slotKey];

  const handleClick = () => {
    if (item && onUnequip) {
      onUnequip(slotKey);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className="p-0 w-fit border-sky-500/20 hover:border-sky-500/30 transition-colors cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="bg-sky-950/20 relative flex h-20 w-20 items-center justify-center overflow-hidden">
        {item ? (
          <>
            <Image
              src={`/${item.icon}`}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/70 py-1">
              <span className="text-xs font-medium text-white px-1 text-center leading-tight truncate">
                {item.name}
              </span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground text-xs">{label}</span>
        )}
      </div>
    </Card>
  );
};

export { SLOT_LABELS };
