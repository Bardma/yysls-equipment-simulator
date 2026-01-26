'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import type { EquipItem, EquippedItems } from '@/lib/types';

interface EquipmentSlotProps {
  slotKey: keyof EquippedItems;
  item: EquipItem | null;
  onClick?: () => void;
  onUnequip?: (slotKey: keyof EquippedItems) => void;
}

export const EquipmentSlot = ({ slotKey, item, onClick, onUnequip }: EquipmentSlotProps) => {
  const t = useTranslations('equipment');
  
  const SLOT_LABELS: Record<keyof EquippedItems, string> = {
    weapon1: t('weapon1'),
    weapon2: t('weapon2'),
    head: t('head'),
    chest: t('chest'),
    ring: t('ring'),
    pendant: t('pendant'),
    legs: t('legs'),
    hands: t('hands'),
  };

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
      className="p-0 w-full sm:w-fit border-sky-500/20 hover:border-sky-500/30 transition-colors cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="bg-sky-950/20 relative flex h-16 w-full sm:h-20 sm:w-20 items-center justify-center overflow-hidden aspect-square">
        {item ? (
          <>
            <Image
              src={`/${item.icon}`}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/70 py-0.5 sm:py-1">
              <span className="text-[10px] sm:text-xs font-medium text-white px-0.5 sm:px-1 text-center leading-tight truncate">
                {item.name}
              </span>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground text-[10px] sm:text-xs">{label}</span>
        )}
      </div>
    </Card>
  );
};
