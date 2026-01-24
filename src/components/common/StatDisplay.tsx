'use client';

import { CommonData } from '@/lib/data/commonData';
import { cn } from '@/lib/utils';

interface StatDisplayProps {
  type: string;
  value: number;
  isPercent?: boolean;
  highlightThreshold?: number;
}

export const StatDisplay = ({
  type,
  value,
  isPercent = false,
  highlightThreshold = 0.875,
}: StatDisplayProps) => {
  const maxValue = CommonData.MAX_VALUES[type] || 0;
  const ratio = maxValue > 0 ? value / maxValue : 0;
  const isHighQuality = ratio > highlightThreshold;

  const colorClass = isHighQuality ? 'text-amber-400' : 'text-[#dfa8ff]/85';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        colorClass
      )}
    >
      <span className="truncate">{type}</span>
      <span className={cn('text-right tabular-nums', isHighQuality && 'font-medium')}>
        +{value}
        {isPercent ? '%' : ''}
      </span>
    </div>
  );
};
