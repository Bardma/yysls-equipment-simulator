'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EquipmentImage } from '@/components/common/EquipmentImage';
import { StatDisplay } from '@/components/common/StatDisplay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommonData } from '@/lib/data/commonData';
import type { EquipItem, StatValue } from '@/lib/types';
import { cn } from '@/lib/utils';

// JiSuanDanGeAffixDeWanZhengDu
const getStatCompleteness = (stat: StatValue): number => {
  const maxValue = CommonData.MAX_VALUES[stat.type] || 0;
  if (maxValue <= 0) return 0;
  return Math.min(stat.value / maxValue, 1);
};

// JiSuanEquipmentZongWanZhengDu（Primary Affix + Secondary AffixDePingJunZhi）
const getEquipCompleteness = (equip: EquipItem): number => {
  const allStats = [equip.mainStat, ...equip.subStats];
  if (allStats.length === 0) return 0;

  const totalCompleteness = allStats.reduce(
    (sum, stat) => sum + getStatCompleteness(stat),
    0
  );
  return (totalCompleteness / allStats.length) * 100;
};

// GenJuWanZhengDuFanHuiYanSeYangShi
const getCompletenessColor = (completeness: number): string => {
  if (completeness >= 90) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
  if (completeness >= 80) return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
  if (completeness >= 70) return 'text-sky-400 bg-sky-500/20 border-sky-500/30';
  return 'text-slate-400 bg-slate-500/20 border-slate-500/30';
};

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
  const t = useTranslations('equipment');

  return (
    <Card
      className={cn(
        'relative cursor-pointer p-2.5 sm:p-3 transition-all border-slate-500/20 bg-slate-800/30 hover:bg-slate-800/50',
        isEquipped
          ? 'border-amber-400 ring-1 ring-amber-400/40 shadow-md shadow-amber-500/10'
          : 'hover:border-slate-400/40'
      )}
      onClick={onClick}
    >
      {/* XuanZhongBiaoJi */}
      {isEquipped && (
        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-amber-500 shadow-md shadow-amber-500/30">
          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-900" strokeWidth={3} />
        </div>
      )}

      <div className="flex justify-end gap-0.5 sm:gap-1">
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 hover:text-slate-300 hover:bg-slate-500/20 text-xs sm:text-sm"
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
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 h-5 w-5 sm:h-6 sm:w-6 text-xs sm:text-sm"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            ×
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <EquipmentImage src={equip.icon} name={equip.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-100 truncate text-sm sm:text-base">{equip.name}</div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs flex-wrap">
            <span className="text-slate-400">
              {equip.slotName} {equip.isChengyin ? t('chengyin') : ''}
            </span>
            {/* WanZhengDuBiaoQian */}
            <span
              className={cn(
                'px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium border',
                getCompletenessColor(getEquipCompleteness(equip))
              )}
            >
              {getEquipCompleteness(equip).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      {/* AffixZu */}
      <div className="mt-1.5 text-[11px] sm:text-xs">
        <StatDisplay
          type={equip.mainStat.type}
          value={equip.mainStat.value}
          isPercent={equip.mainStat.isPercent}
        />
        <Separator className="my-1 bg-slate-600/40" />
        <div className="space-y-0.5 sm:space-y-1">
          {equip.subStats.map((sub, idx) => (
            <StatDisplay
              key={`${equip.id}-sub-${idx}`}
              type={sub.type}
              value={sub.value}
              isPercent={sub.isPercent}
            />
          ))}
        </div>
        {/* Dingyin Affix */}
        {equip.dingyinStat && equip.dingyinStat.type !== 'None' && (
          <>
            <Separator className="my-1 bg-cyan-600/40" />
            <StatDisplay
              type={equip.dingyinStat.type}
              value={equip.dingyinStat.value}
              isPercent={equip.dingyinStat.isPercent}
            />
          </>
        )}
      </div>
    </Card>
  );
};
