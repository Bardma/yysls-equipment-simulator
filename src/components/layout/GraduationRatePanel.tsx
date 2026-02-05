'use client';

import { useTranslations } from 'next-intl';

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
  const t = useTranslations('graduation');

  return (
    <CollapsibleCard
      title={t('title')}
      icon="🎓"
      expanded={expanded}
      onToggle={onToggle}
      themeColor="amber"
    >
      <div className="space-y-3">
        {!hasRotation || !graduationInfo ? (
          <div className="text-muted-foreground text-xs sm:text-sm">
            {t('noRotation')}
          </div>
        ) : (
          <div className={`relative rounded-lg sm:rounded-xl p-2.5 sm:p-3 border ${
            loanDingyin && earlySeasonBonus
              ? 'bg-linear-to-br from-purple-500/10 via-cyan-500/5 to-cyan-500/10 border-purple-500/30'
              : loanDingyin
                ? 'bg-linear-to-br from-purple-500/10 via-purple-500/5 to-amber-500/10 border-purple-500/30'
                : earlySeasonBonus
                  ? 'bg-linear-to-br from-cyan-500/10 via-cyan-500/5 to-amber-500/10 border-cyan-500/30'
                  : 'bg-linear-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-yellow-500/20'
          }`}>
            <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 rounded-bl-full pointer-events-none ${
              loanDingyin && earlySeasonBonus
                ? 'bg-linear-to-bl from-purple-400/20 via-cyan-400/10 to-transparent'
                : loanDingyin
                  ? 'bg-linear-to-bl from-purple-400/20 to-transparent'
                  : earlySeasonBonus
                    ? 'bg-linear-to-bl from-cyan-400/20 to-transparent'
                    : 'bg-linear-to-bl from-yellow-400/20 to-transparent'
            }`} />
            <div className="relative space-y-1.5 sm:space-y-2">
              {(loanDingyin || earlySeasonBonus) && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs mb-1">
                  {loanDingyin && (
                    <div className="flex items-center gap-1.5 text-purple-300">
                      <span>💰</span>
                      <span>{t('loanDingyinLabel')}</span>
                    </div>
                  )}
                  {earlySeasonBonus && (
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <span>⏩</span>
                      <span>{t('earlySeasonLabel')}</span>
                    </div>
                  )}
                </div>
              )}
              <div className={`text-3xl sm:text-4xl font-bold bg-clip-text text-transparent drop-shadow-sm tracking-tight ${
                loanDingyin && earlySeasonBonus
                  ? 'bg-linear-to-r from-purple-300 via-cyan-200 to-cyan-300'
                  : loanDingyin
                    ? 'bg-linear-to-r from-purple-300 via-purple-200 to-amber-300'
                    : earlySeasonBonus
                      ? 'bg-linear-to-r from-cyan-300 via-cyan-200 to-amber-300'
                      : 'bg-linear-to-r from-yellow-300 via-amber-300 to-yellow-400'
              }`}>
                {graduationInfo.accurate}
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs font-medium">
                    E
                  </span>
                  <span className="text-muted-foreground">{t('excel')}</span>
                  <span className="ml-auto font-medium text-yellow-200/90">
                    {graduationInfo.excel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-orange-500/20 text-orange-400 text-[10px] sm:text-xs font-medium">
                    D
                  </span>
                  <span className="text-muted-foreground">{t('dps')}</span>
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
            {t('earlySeasonBonus')}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-500/20 text-amber-400 text-[9px] sm:text-[10px] cursor-help shrink-0 hover:bg-amber-500/30 transition-colors">
                ?
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-zinc-900 border border-zinc-700 p-2 w-auto" side="top" align="center">
              <div className="text-xs space-y-1">
                <div className="text-amber-400 font-medium mb-1">{t('bonusStats')}</div>
                <div className="text-zinc-300">{t('precision')}：+1.4%</div>
                <div className="text-zinc-500 pl-2">Strength：+14</div>
                <div className="text-zinc-500 pl-2">Agility：+14</div>
                <div className="text-zinc-500 pl-2">Momentum：+14</div>
                <div className="text-zinc-500 pl-2">Ti：+14</div>
                <div className="text-zinc-500 pl-2">Yu：+14</div>
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
            {t('loanDingyin')}
          </span>
        </div>

        <Button
          size="sm"
          className="w-full cursor-pointer bg-linear-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-900/20 text-xs sm:text-sm h-8 sm:h-9"
          onClick={onAnalyze}
        >
          {t('analyze')}
        </Button>
      </div>
    </CollapsibleCard>
  );
};
