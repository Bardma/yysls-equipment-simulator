'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { calcRateWithStatModifier, findBestStatsForSlotAsync, SLOT_NAME_MAP } from '@/lib/graduation';
import { Calculator } from '@/lib/calculator';
import type { EquippedItems } from '@/lib/types';
import { statLabel } from '@/lib/statName';

interface CultivationTabProps {
  equippedItems: EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  currentRate: number;
}

interface CultivationResult {
  bestImprovementEquip: any;
  secondBestWeapon: any | null;
}

export const CultivationTab = ({
  equippedItems,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  currentRate,
}: CultivationTabProps) => {
  const [status, setStatus] = useState<{
    running: boolean;
    text: string;
    percent: number;
    result: CultivationResult | null;
  }>({ running: false, text: '', percent: 0, result: null });

  const cultivationSummary = useMemo(() => {
    const statSummary: Record<string, number> = {};
    let totalDingyinValue = 0;
    let totalDingyinMax = 0;

    (Object.keys(SLOT_NAME_MAP) as Array<keyof EquippedItems>).forEach((slotKey) => {
      const equip = equippedItems[slotKey];
      if (!equip) return;

      const mainStat = equip.mainStat;
      if (mainStat && mainStat.type !== '生存类词条' && mainStat.type !== '生存向') {
        const maxValue = CommonData.MAX_VALUES[mainStat.type];
        if (maxValue) {
          statSummary[mainStat.type] =
            (statSummary[mainStat.type] || 0) + mainStat.value / maxValue;
        }
      }

      equip.subStats.forEach((sub) => {
        if (sub.type !== '生存类词条' && sub.type !== '生存向') {
          const maxValue = CommonData.MAX_VALUES[sub.type];
          if (maxValue) {
            statSummary[sub.type] = (statSummary[sub.type] || 0) + sub.value / maxValue;
          }
        }
      });

      if (equip.dingyinStat && equip.dingyinStat.type) {
        const maxValue = CommonData.MAX_VALUES[equip.dingyinStat.type];
        if (maxValue) {
          totalDingyinValue += equip.dingyinStat.value;
          totalDingyinMax += maxValue;
        }
      }
    });

    const sortedStats = Object.entries(statSummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
    const totalStatsCount = Object.values(statSummary).reduce((sum, val) => sum + val, 0);
    const dingyinPercent = totalDingyinMax > 0 ? (totalDingyinValue / totalDingyinMax) * 100 : 0;

    return { sortedStats, totalStatsCount, dingyinPercent };
  }, [equippedItems]);

  const startCultivation = async () => {
    const slots = (Object.keys(SLOT_NAME_MAP) as Array<keyof EquippedItems>).filter(
      (slotKey) => equippedItems[slotKey]
    );
    if (!slots.length) return;

    setStatus({ running: true, text: 'Starting analysis...', percent: 0, result: null });

    const rotationConfig = ClassConfig.ROTATIONS[currentClass];
    const rotation = rotationConfig?.rotation || [];
    const baselineValue = rotationConfig?.baseline || 4244078.34;
    const skillDb = rotationConfig?.skillDatabase || {};
    const baseRate = currentRate;

    const equipImprovements: Array<any> = [];

    for (let idx = 0; idx < slots.length; idx++) {
      const slotKey = slots[idx];
      const equip = equippedItems[slotKey]!;
      const tempEquips = JSON.parse(JSON.stringify(equippedItems)) as EquippedItems;
      const tempEquip = tempEquips[slotKey];

      if (tempEquip) {
        tempEquip.mainStat = { ...tempEquip.mainStat, value: 0 };
        tempEquip.subStats.forEach((sub) => {
          sub.value = 0;
        });
      }

      const params = calcRateWithStatModifier(
        tempEquips,
        currentClass,
        bowType,
        xinfaLoadout,
        setType,
        null,
        earlySeasonBonus
      );
      const result = Calculator.calculateGraduationRate(
        params,
        skillDb,
        rotation,
        baselineValue,
        false
      );
      const blankRate = parseFloat(result.graduationRate);
      const originalContribution = baseRate - blankRate;

      const { bestRate, bestMainStat, bestSubStats } = await findBestStatsForSlotAsync(
        slotKey,
        equip,
        tempEquips,
        currentClass,
        bowType,
        xinfaLoadout,
        setType,
        skillDb,
        rotation,
        baselineValue,
        blankRate,
        earlySeasonBonus,
        (text) => {
          setStatus({
            running: true,
            text: `Analyzing ${SLOT_NAME_MAP[slotKey]}: ${text}`,
            percent: Math.min(100, ((idx + 1) / slots.length) * 100),
            result: null,
          });
        }
      );

      const maxContribution = bestRate - blankRate;
      const improvementSpace = maxContribution - originalContribution;

      equipImprovements.push({
        slotKey,
        slotName: SLOT_NAME_MAP[slotKey],
        equip,
        originalContribution,
        maxContribution,
        improvementSpace,
        bestMainStat,
        bestSubStats,
      });
    }

    equipImprovements.sort((a, b) => b.improvementSpace - a.improvementSpace);
    const bestImprovementEquip = equipImprovements[0];

    let secondBestWeapon = null;
    if (
      bestImprovementEquip &&
      bestImprovementEquip.slotKey !== 'weapon1' &&
      bestImprovementEquip.slotKey !== 'weapon2'
    ) {
      const weapon1 = equipImprovements.find((item) => item.slotKey === 'weapon1');
      const weapon2 = equipImprovements.find((item) => item.slotKey === 'weapon2');
      if (weapon1 && weapon2) {
        secondBestWeapon = weapon1.improvementSpace > weapon2.improvementSpace ? weapon1 : weapon2;
      } else if (weapon1) {
        secondBestWeapon = weapon1;
      } else if (weapon2) {
        secondBestWeapon = weapon2;
      }
    }

    setStatus({
      running: false,
      text: 'Analysis complete',
      percent: 100,
      result: { bestImprovementEquip, secondBestWeapon },
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="border-border/60 bg-card space-y-2 sm:space-y-3 rounded-lg border p-2.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="font-medium text-yellow-300 text-sm sm:text-base">Cultivation Summary</div>
          <div className="text-muted-foreground text-[10px] sm:text-sm">
            All-stats total (by max-value ratio):
            <span className="ml-1 font-semibold text-yellow-300">
              {cultivationSummary.totalStatsCount.toFixed(1)}/40 entries
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3">
          {cultivationSummary.sortedStats.map(([stat, count]) => (
            <div
              key={statLabel(stat)}
              className="border-border/60 bg-background/40 rounded-md border p-1.5 sm:p-2 text-[10px] sm:text-xs"
            >
              <div className="text-foreground font-medium truncate">{statLabel(stat)}</div>
              <div className="text-muted-foreground mt-0.5 sm:mt-1">{count.toFixed(2)} entries</div>
            </div>
          ))}
        </div>
        <div className="border-border/60 bg-background/40 rounded-md border p-1.5 sm:p-2 text-[10px] sm:text-xs">
          <div className="text-foreground font-medium">Attunement Summary</div>
          <div className="text-muted-foreground mt-0.5 sm:mt-1">
            Overall max-value ratio:
            <span className="ml-1 font-semibold text-yellow-300">
              {cultivationSummary.dingyinPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <Button size="sm" onClick={startCultivation} disabled={status.running} className="text-xs sm:text-sm">
        {status.running ? 'Analyzing...' : 'Calculate Cultivation Advice'}
      </Button>

      {status.running && (
        <div className="text-muted-foreground text-[10px] sm:text-sm">
          {status.text} ({status.percent.toFixed(1)}%)
        </div>
      )}

      {status.result && (
        <div className="space-y-4 sm:space-y-6">
          {status.result.bestImprovementEquip && (
            <div className="border-yellow-500/40 bg-card rounded-lg border p-2.5 sm:p-4 space-y-3 sm:space-y-4">
              {/* 装备头部信息 */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-border/60 bg-background/60 flex items-center justify-center overflow-hidden shrink-0">
                  {status.result.bestImprovementEquip.equip?.icon ? (
                    <img
                      src={status.result.bestImprovementEquip.equip.icon}
                      alt={status.result.bestImprovementEquip.slotName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl text-muted-foreground">
                      {status.result.bestImprovementEquip.slotName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-lg font-semibold text-yellow-300">
                    {status.result.bestImprovementEquip.slotName}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    {status.result.bestImprovementEquip.equip?.name || 'Unnamed Equipment'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Highest improvement potential</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Improvement</div>
                  <div className="text-lg sm:text-2xl font-bold text-red-400">
                    {status.result.bestImprovementEquip.improvementSpace.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 分析结果说明 */}
              <div className="border-l-2 border-yellow-500/60 bg-yellow-500/10 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm">
                <span className="font-semibold text-yellow-300">Analysis Result:</span>
                Current contribution 
                <span className="font-semibold text-yellow-300">
                  {status.result.bestImprovementEquip.originalContribution.toFixed(2)}%
                </span>
; upper bound{' '}
                <span className="font-semibold text-yellow-300">
                  {status.result.bestImprovementEquip.maxContribution.toFixed(2)}%
                </span>
                ; improvement{' '}
                <span className="font-semibold text-red-400">
                  {status.result.bestImprovementEquip.improvementSpace.toFixed(2)}%
                </span>
                <span className="hidden sm:inline">
                   . This slot has the highest improvement potential among all slots. Prioritize cultivating or replacing this slot first.
                </span>
              </div>

              {/* Recommended Stat Setup */}
              <div className="border-border/60 bg-background/40 rounded-lg border p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-yellow-300 font-medium text-xs sm:text-base">
                  <span>💡</span>
                  <span>Recommended Stat Setup</span>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  Setup for maximum contribution ({status.result.bestImprovementEquip.maxContribution.toFixed(2)}%):
                </div>

                {/* Main Stat */}
                {status.result.bestImprovementEquip.bestMainStat && (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Main Stat</div>
                    <div className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="font-medium text-xs sm:text-base">
                        {statLabel(status.result.bestImprovementEquip.bestMainStat.stat)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        Max: {CommonData.MAX_VALUES[status.result.bestImprovementEquip.bestMainStat.stat] || '-'}
                        {CommonData.PERCENT_STATS.includes(status.result.bestImprovementEquip.bestMainStat.stat) ? '%' : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Stats */}
                {status.result.bestImprovementEquip.bestSubStats?.length > 0 && (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      Sub Stats (recommended {status.result.bestImprovementEquip.bestSubStats.length} entries)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2">
                      {status.result.bestImprovementEquip.bestSubStats.map((stat: any, idx: number) => (
                        <div
                          key={stat.stat}
                          className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <div className="font-medium text-[10px] sm:text-base truncate">
                            {idx + 1}. {statLabel(stat.stat)}
                          </div>
                          <div className="text-[9px] sm:text-xs text-muted-foreground">
                            Max: {CommonData.MAX_VALUES[stat.stat] || '-'}
                            {CommonData.PERCENT_STATS.includes(stat.stat) ? '%' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {status.result.secondBestWeapon && (
            <div className="border-border/60 bg-card rounded-lg border p-2.5 sm:p-4 space-y-3 sm:space-y-4">
              {/* 装备头部信息 */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-border/60 bg-background/60 flex items-center justify-center overflow-hidden shrink-0">
                  {status.result.secondBestWeapon.equip?.icon ? (
                    <img
                      src={status.result.secondBestWeapon.equip.icon}
                      alt={status.result.secondBestWeapon.slotName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl text-muted-foreground">
                      {status.result.secondBestWeapon.slotName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-lg font-semibold">
                    {status.result.secondBestWeapon.slotName}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    {status.result.secondBestWeapon.equip?.name || 'Unnamed Equipment'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Higher weapon improvement potential</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Improvement</div>
                  <div className="text-lg sm:text-2xl font-bold text-red-400">
                    {status.result.secondBestWeapon.improvementSpace.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Recommended Stat Setup */}
              <div className="border-border/60 bg-background/40 rounded-lg border p-2.5 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 text-yellow-300 font-medium text-xs sm:text-base">
                  <span>💡</span>
                  <span>Recommended Stat Setup</span>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  Setup for maximum contribution ({status.result.secondBestWeapon.maxContribution.toFixed(2)}%):
                </div>

                {/* Main Stat */}
                {status.result.secondBestWeapon.bestMainStat && (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Main Stat</div>
                    <div className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-2 sm:px-3 py-1.5 sm:py-2">
                      <div className="font-medium text-xs sm:text-base">
                        {statLabel(status.result.secondBestWeapon.bestMainStat.stat)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        Max: {CommonData.MAX_VALUES[status.result.secondBestWeapon.bestMainStat.stat] || '-'}
                        {CommonData.PERCENT_STATS.includes(status.result.secondBestWeapon.bestMainStat.stat) ? '%' : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Stats */}
                {status.result.secondBestWeapon.bestSubStats?.length > 0 && (
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-[10px] sm:text-xs text-muted-foreground">
                      Sub Stats (recommended {status.result.secondBestWeapon.bestSubStats.length} entries)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2">
                      {status.result.secondBestWeapon.bestSubStats.map((stat: any, idx: number) => (
                        <div
                          key={stat.stat}
                          className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <div className="font-medium text-[10px] sm:text-base truncate">
                            {idx + 1}. {statLabel(stat.stat)}
                          </div>
                          <div className="text-[9px] sm:text-xs text-muted-foreground">
                            Max: {CommonData.MAX_VALUES[stat.stat] || '-'}
                            {CommonData.PERCENT_STATS.includes(stat.stat) ? '%' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
