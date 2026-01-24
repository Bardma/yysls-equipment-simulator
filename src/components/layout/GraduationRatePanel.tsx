'use client';

import { CollapsibleCard } from '@/components/common/CollapsibleCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface GraduationRatePanelProps {
  graduationInfo: {
    accurate: string;
    excel: string;
    dps: number;
  } | null;
  hasRotation: boolean;
  earlySeasonBonus: boolean;
  onEarlySeasonChange: (value: boolean) => void;
  onAnalyze: () => void;
  expanded: boolean;
  onToggle: () => void;
}

export const GraduationRatePanel = ({
  graduationInfo,
  hasRotation,
  earlySeasonBonus,
  onEarlySeasonChange,
  onAnalyze,
  expanded,
  onToggle,
}: GraduationRatePanelProps) => {
  return (
    <CollapsibleCard
      title="当前毕业率"
      icon="🎓"
      expanded={expanded}
      onToggle={onToggle}
      themeColor="amber"
    >
      <div className="space-y-3">
        {!hasRotation || !graduationInfo ? (
          <div className="text-muted-foreground text-sm">
            毕业率表格未配置，请等待更新
          </div>
        ) : (
          <div className="relative rounded-xl bg-linear-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-3 border border-yellow-500/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-yellow-400/20 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative space-y-2">
              <div className="text-4xl font-bold bg-linear-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                {graduationInfo.accurate}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    E
                  </span>
                  <span className="text-muted-foreground">表格显示</span>
                  <span className="ml-auto font-medium text-yellow-200/90">
                    {graduationInfo.excel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-orange-500/20 text-orange-400 text-xs font-medium">
                    D
                  </span>
                  <span className="text-muted-foreground">轴期望秒伤</span>
                  <span className="ml-auto font-medium text-orange-200/90">
                    {graduationInfo.dps.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-1">
          <Checkbox
            checked={earlySeasonBonus}
            onCheckedChange={(value) => onEarlySeasonChange(Boolean(value))}
          />
          <span className="text-muted-foreground text-xs">
            提前获得下半赛季属性（毕业率将虚高）
          </span>
        </div>

        <Button
          className="w-full cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20"
          onClick={onAnalyze}
        >
          毕业率分析
        </Button>
      </div>
    </CollapsibleCard>
  );
};
