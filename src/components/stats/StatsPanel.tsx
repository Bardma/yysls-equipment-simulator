'use client';

import { CollapsibleCard } from '@/components/common/CollapsibleCard';

interface StatsPanelProps {
  statDisplay: Array<{ label: string; value: string }>;
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
              className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-emerald-500/5 transition-colors"
            >
              <span className="text-emerald-300/70">{item.label}</span>
              <span className="font-medium text-emerald-100/90">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
};
