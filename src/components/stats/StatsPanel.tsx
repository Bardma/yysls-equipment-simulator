'use client';

import { useTranslations } from 'next-intl';

import { CollapsibleCard } from '@/components/common/CollapsibleCard';
import { statLabel } from '@/lib/statName';

interface StatsPanelProps {
  statDisplay: Array<{ label: string; value: string; highlight?: string; suffix?: string; isLoaned?: boolean; isEarlySeason?: boolean }>;
  expanded: boolean;
  onToggle: () => void;
}

export const StatsPanel = ({ statDisplay, expanded, onToggle }: StatsPanelProps) => {
  const t = useTranslations('stats');

  return (
    <CollapsibleCard
      title={t('title')}
      icon="📊"
      expanded={expanded}
      onToggle={onToggle}
      themeColor="emerald"
      className={expanded ? 'flex-1 overflow-y-auto' : ''}
    >
      {statDisplay.length === 0 ? (
        <div className="text-muted-foreground text-xs sm:text-sm">{t('noStats')}</div>
      ) : (
        <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm">
          {statDisplay.map((item) => {
            const hasBothMarks = item.isLoaned && item.isEarlySeason;
            const hasAnyMark = item.isLoaned || item.isEarlySeason;

            const getBgClass = () => {
              if (hasBothMarks) return 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 hover:from-purple-500/15 hover:to-cyan-500/15 border border-purple-500/20';
              if (item.isLoaned) return 'bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20';
              if (item.isEarlySeason) return 'bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20';
              return 'hover:bg-emerald-500/5';
            };

            const getLabelClass = () => {
              if (hasBothMarks) return 'text-purple-300/90';
              if (item.isLoaned) return 'text-purple-300/90';
              if (item.isEarlySeason) return 'text-cyan-300/90';
              return 'text-emerald-300/70';
            };

            const getValueClass = () => {
              if (hasBothMarks) return 'text-purple-200';
              if (item.isLoaned) return 'text-purple-200';
              if (item.isEarlySeason) return 'text-cyan-200';
              return 'text-emerald-100/90';
            };

            return (
              <div
                key={statLabel(item.label)}
                className={`flex items-center justify-between py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-md transition-colors ${getBgClass()}`}
              >
                <span className={getLabelClass()}>
                  {hasAnyMark && (
                    <span className="mr-1">
                      {item.isLoaned && <span className="text-purple-400">💰</span>}
                      {item.isEarlySeason && <span className="text-cyan-400">⏩</span>}
                    </span>
                  )}
                  {statLabel(item.label)}
                </span>
                <span className={`font-medium ${getValueClass()}`}>
                  {item.value}
                  {item.highlight && <span className="text-amber-400">{item.highlight}</span>}
                  {item.suffix && <span className="text-emerald-400/60 text-[10px] sm:text-xs">{item.suffix}</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </CollapsibleCard>
  );
};
