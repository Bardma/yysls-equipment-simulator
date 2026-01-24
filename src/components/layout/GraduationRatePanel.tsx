'use client';

import { CollapsibleCard } from '@/components/common/CollapsibleCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface GraduationRatePanelProps {
  graduationInfo: {
    accurate: string;
    excel: string;
    dps: number;
  } | null;
  hasRotation: boolean;
  earlySeasonBonus: boolean;
  loanDingyin: boolean;
  onEarlySeasonChange: (value: boolean) => void;
  onLoanDingyinChange: (value: boolean) => void;
  onAnalyze: () => void;
  expanded: boolean;
  onToggle: () => void;
}

export const GraduationRatePanel = ({
  graduationInfo,
  hasRotation,
  earlySeasonBonus,
  loanDingyin,
  onEarlySeasonChange,
  onLoanDingyinChange,
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
          <div className="text-muted-foreground text-xs sm:text-sm">
            毕业率表格未配置，请等待更新
          </div>
        ) : (
          <div className={`relative rounded-lg sm:rounded-xl p-2.5 sm:p-3 border ${
            loanDingyin
              ? 'bg-linear-to-br from-purple-500/10 via-purple-500/5 to-amber-500/10 border-purple-500/30'
              : 'bg-linear-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-yellow-500/20'
          }`}>
            <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-full pointer-events-none ${
              loanDingyin ? 'bg-linear-to-bl from-purple-400/20 to-transparent' : 'bg-linear-to-bl from-yellow-400/20 to-transparent'
            }`} />
            <div className="relative space-y-1.5 sm:space-y-2">
              {loanDingyin && (
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-purple-300 mb-1">
                  <span>💰</span>
                  <span>贷款满定音</span>
                </div>
              )}
              <div className={`text-3xl sm:text-4xl font-bold bg-clip-text text-transparent drop-shadow-sm tracking-tight ${
                loanDingyin
                  ? 'bg-linear-to-r from-purple-300 via-purple-200 to-amber-300'
                  : 'bg-linear-to-r from-yellow-300 via-amber-300 to-yellow-400'
              }`}>
                {graduationInfo.accurate}
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs font-medium">
                    E
                  </span>
                  <span className="text-muted-foreground">表格显示</span>
                  <span className="ml-auto font-medium text-yellow-200/90">
                    {graduationInfo.excel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500/20 text-orange-400 text-[10px] sm:text-xs font-medium">
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

        <div className="flex items-center gap-1.5 sm:gap-2 px-0.5 sm:px-1">
          <Checkbox
            checked={earlySeasonBonus}
            onCheckedChange={(value) => onEarlySeasonChange(Boolean(value))}
            className="h-4 w-4"
          />
          <span className="text-muted-foreground text-[10px] sm:text-xs leading-tight">
            提前获得下半赛季属性（毕业率将虚高）
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px] sm:text-[10px] cursor-help shrink-0 hover:bg-amber-500/30 transition-colors">
                ?
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-zinc-900 border border-zinc-700 p-2 w-auto" side="top" align="center">
              <div className="text-xs space-y-1">
                <div className="text-amber-400 font-medium mb-1">增加属性</div>
                <div className="text-zinc-300">精准率：+1.4%</div>
                <div className="text-zinc-500 pl-2">劲：+14</div>
                <div className="text-zinc-500 pl-2">敏：+14</div>
                <div className="text-zinc-500 pl-2">势：+14</div>
                <div className="text-zinc-500 pl-2">体：+14</div>
                <div className="text-zinc-500 pl-2">御：+14</div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 px-0.5 sm:px-1">
          <Checkbox
            checked={loanDingyin}
            onCheckedChange={(value) => onLoanDingyinChange(Boolean(value))}
            className="h-4 w-4"
          />
          <span className="text-muted-foreground text-[10px] sm:text-xs">
            贷款本赛季满定音
          </span>
        </div>

        <Button
          size="sm"
          className="w-full cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20 text-xs sm:text-sm h-8 sm:h-9"
          onClick={onAnalyze}
        >
          毕业率分析
        </Button>
      </div>
    </CollapsibleCard>
  );
};
