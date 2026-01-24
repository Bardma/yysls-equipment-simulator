'use client';

import { CollapsibleCard } from '@/components/common/CollapsibleCard';

interface StatsPanelProps {
  statDisplay: Array<{ label: string; value: string; highlight?: string; suffix?: string; isLoaned?: boolean }>;
  expanded: boolean;
  onToggle: () => void;
}

export const StatsPanel = ({ statDisplay, expanded, onToggle }: StatsPanelProps) => {
  return (
    <CollapsibleCard
      title="面板属性"
      icon="📊"
      expanded={expanded}
      onToggle={onToggle}
      themeColor="emerald"
      className={expanded ? 'flex-1 overflow-y-auto' : ''}
    >
      {statDisplay.length === 0 ? (
        <div className="text-muted-foreground text-sm">暂无面板属性</div>
      ) : (
        <div className="space-y-1.5 text-sm">
          {statDisplay.map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-1 px-2 rounded-md transition-colors ${
                item.isLoaned
                  ? 'bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20'
                  : 'hover:bg-emerald-500/5'
              }`}
            >
              <span className={item.isLoaned ? 'text-purple-300/90' : 'text-emerald-300/70'}>
                {item.isLoaned && <span className="text-purple-400 mr-1">💰</span>}
                {item.label}
              </span>
              <span className={`font-medium ${item.isLoaned ? 'text-purple-200' : 'text-emerald-100/90'}`}>
                {item.value}
                {item.highlight && <span className="text-amber-400">{item.highlight}</span>}
                {item.suffix && <span className="text-emerald-400/60 text-xs">{item.suffix}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
};
