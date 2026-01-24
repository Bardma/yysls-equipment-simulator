'use client';

import { EquipmentImage } from '@/components/common/EquipmentImage';
import { StatDisplay } from '@/components/common/StatDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { EquipItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EquipmentCardProps {
  equip: EquipItem;
  isEquipped?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EquipmentCard = ({
  equip,
  isEquipped = false,
  onClick,
  onEdit,
  onDelete,
}: EquipmentCardProps) => {
  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition-all border-slate-500/20 bg-slate-800/30 hover:bg-slate-800/50',
        isEquipped
          ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-md shadow-amber-500/10'
          : 'hover:border-slate-400/40'
      )}
      onClick={onClick}
    >
      <div className="-mt-1 flex justify-end gap-1">
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-slate-400 hover:text-slate-300 hover:bg-slate-500/20"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            ✎
          </Button>
        )}
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 h-7 w-7"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            ×
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <EquipmentImage src={equip.icon} name={equip.name} size="md" />
        <div className="flex-1">
          <div className="font-medium text-slate-100">{equip.name}</div>
          <div className="text-slate-400 text-xs">
            {equip.slotName} {equip.isChengyin ? '(承音)' : ''}
          </div>
        </div>
      </div>
      <Separator className="my-3 bg-slate-600/40" />
      <div className="space-y-1.5 text-xs">
        <StatDisplay
          type={equip.mainStat.type}
          value={equip.mainStat.value}
          isPercent={equip.mainStat.isPercent}
          isMain
        />
        {equip.subStats.map((sub, idx) => (
          <StatDisplay
            key={`${equip.id}-sub-${idx}`}
            type={sub.type}
            value={sub.value}
            isPercent={sub.isPercent}
          />
        ))}
      </div>
    </Card>
  );
};
