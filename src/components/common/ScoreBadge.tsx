'use client';

import { CommonData } from '@/lib/data/commonData';
import type { EquipItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  equip: EquipItem;
  variant?: 'default' | 'compact';
  className?: string;
}

export const getEquipScore = (equip: EquipItem): string => {
  if (equip.isChengyin) return '94.0%';

  let totalPct = 0;
  let count = 0;

  if (
    equip.mainStat &&
    equip.mainStat.type !== '生存类词条' &&
    equip.mainStat.type !== '生存向'
  ) {
    const maxVal = CommonData.MAX_VALUES[equip.mainStat.type];
    if (maxVal) {
      totalPct += equip.mainStat.value / maxVal;
      count++;
    }
  }

  equip.subStats.forEach((sub) => {
    if (sub.type !== '生存类词条' && sub.type !== '生存向') {
      const maxVal = CommonData.MAX_VALUES[sub.type];
      if (maxVal) {
        totalPct += sub.value / maxVal;
        count++;
      }
    }
  });

  return count > 0 ? `${((totalPct / count) * 100).toFixed(1)}%` : '0.0%';
};

export const ScoreBadge = ({
  equip,
  variant = 'default',
  className,
}: ScoreBadgeProps) => {
  const score = getEquipScore(equip);

  if (variant === 'compact') {
    return (
      <span className={cn('text-muted-foreground text-xs', className)}>
        {score}
      </span>
    );
  }

  return (
    <span className={cn('text-yellow-300 text-xs font-medium', className)}>
      均值: {score}
    </span>
  );
};
