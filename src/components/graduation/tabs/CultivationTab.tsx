'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { calcRateWithStatModifier, findBestStatsForSlotAsync, SLOT_NAME_MAP } from '@/lib/graduation';
import { Calculator } from '@/lib/calculator';
import type { EquippedItems } from '@/lib/types';

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

    setStatus({ running: true, text: '开始分析...', percent: 0, result: null });

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
            text: `分析 ${SLOT_NAME_MAP[slotKey]}：${text}`,
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
      text: '分析完成',
      percent: 100,
      result: { bestImprovementEquip, secondBestWeapon },
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-border/60 bg-card space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium text-yellow-300">培养总结</div>
          <div className="text-muted-foreground text-sm">
            全词条统计（按满值比）总和：
            <span className="ml-1 font-semibold text-yellow-300">
              {cultivationSummary.totalStatsCount.toFixed(1)}/40条
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {cultivationSummary.sortedStats.map(([stat, count]) => (
            <div
              key={stat}
              className="border-border/60 bg-background/40 rounded-md border p-2 text-xs"
            >
              <div className="text-foreground font-medium">{stat}</div>
              <div className="text-muted-foreground mt-1">{count.toFixed(2)}条</div>
            </div>
          ))}
        </div>
        <div className="border-border/60 bg-background/40 rounded-md border p-2 text-xs">
          <div className="text-foreground font-medium">定音词条总结</div>
          <div className="text-muted-foreground mt-1">
            总体占满值百分比：
            <span className="ml-1 font-semibold text-yellow-300">
              {cultivationSummary.dingyinPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <Button onClick={startCultivation} disabled={status.running}>
        {status.running ? '分析中...' : '计算培养建议'}
      </Button>

      {status.running && (
        <div className="text-muted-foreground text-sm">
          {status.text} ({status.percent.toFixed(1)}%)
        </div>
      )}

      {status.result && (
        <div className="space-y-6">
          {status.result.bestImprovementEquip && (
            <div className="border-yellow-500/40 bg-card rounded-lg border p-4 space-y-4">
              {/* 装备头部信息 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-border/60 bg-background/60 flex items-center justify-center overflow-hidden">
                  {status.result.bestImprovementEquip.equip?.icon ? (
                    <img
                      src={status.result.bestImprovementEquip.equip.icon}
                      alt={status.result.bestImprovementEquip.slotName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-muted-foreground">
                      {status.result.bestImprovementEquip.slotName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-yellow-300">
                    {status.result.bestImprovementEquip.slotName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {status.result.bestImprovementEquip.equip?.name || '未命名装备'}
                  </div>
                  <div className="text-xs text-muted-foreground">提升空间最大</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">提升空间</div>
                  <div className="text-2xl font-bold text-green-400">
                    {status.result.bestImprovementEquip.improvementSpace.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 分析结果说明 */}
              <div className="border-l-2 border-yellow-500/60 bg-yellow-500/10 px-3 py-2 text-sm">
                <span className="font-semibold text-yellow-300">分析结果：</span>
                该部位当前装备的贡献率（所有主副词条加起来提高的毕业率）为{' '}
                <span className="font-semibold text-yellow-300">
                  {status.result.bestImprovementEquip.originalContribution.toFixed(2)}%
                </span>
                ，最优词条配置的贡献率上限为{' '}
                <span className="font-semibold text-yellow-300">
                  {status.result.bestImprovementEquip.maxContribution.toFixed(2)}%
                </span>
                ，提升空间为{' '}
                <span className="font-semibold text-green-400">
                  {status.result.bestImprovementEquip.improvementSpace.toFixed(2)}%
                </span>
                ，是所有部位中提升空间最大的一个。基于此，建议优先培养或更换此部位的装备。
              </div>

              {/* 推荐词条配置 */}
              <div className="border-border/60 bg-background/40 rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2 text-yellow-300 font-medium">
                  <span>💡</span>
                  <span>推荐词条配置</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  以下词条配置可以最大化该部位对毕业率的贡献（
                  {status.result.bestImprovementEquip.maxContribution.toFixed(2)}%）：
                </div>

                {/* 主词条 */}
                {status.result.bestImprovementEquip.bestMainStat && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">主词条</div>
                    <div className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-3 py-2">
                      <div className="font-medium">
                        {status.result.bestImprovementEquip.bestMainStat.stat}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        满值：{CommonData.MAX_VALUES[status.result.bestImprovementEquip.bestMainStat.stat] || '-'}
                        {CommonData.PERCENT_STATS.includes(status.result.bestImprovementEquip.bestMainStat.stat) ? '%' : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* 副词条 */}
                {status.result.bestImprovementEquip.bestSubStats?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      副词条（推荐{status.result.bestImprovementEquip.bestSubStats.length}条）
                    </div>
                    <div className="space-y-2">
                      {status.result.bestImprovementEquip.bestSubStats.map((stat: any, idx: number) => (
                        <div
                          key={stat.stat}
                          className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-3 py-2"
                        >
                          <div className="font-medium">
                            {idx + 1}. {stat.stat}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            满值：{CommonData.MAX_VALUES[stat.stat] || '-'}
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
            <div className="border-border/60 bg-card rounded-lg border p-4 space-y-4">
              {/* 装备头部信息 */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-border/60 bg-background/60 flex items-center justify-center overflow-hidden">
                  {status.result.secondBestWeapon.equip?.icon ? (
                    <img
                      src={status.result.secondBestWeapon.equip.icon}
                      alt={status.result.secondBestWeapon.slotName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-muted-foreground">
                      {status.result.secondBestWeapon.slotName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">
                    {status.result.secondBestWeapon.slotName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {status.result.secondBestWeapon.equip?.name || '未命名装备'}
                  </div>
                  <div className="text-xs text-muted-foreground">武器提升空间更大者</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">提升空间</div>
                  <div className="text-2xl font-bold text-green-400">
                    {status.result.secondBestWeapon.improvementSpace.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 推荐词条配置 */}
              <div className="border-border/60 bg-background/40 rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2 text-yellow-300 font-medium">
                  <span>💡</span>
                  <span>推荐词条配置</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  以下词条配置可以最大化该部位对毕业率的贡献（
                  {status.result.secondBestWeapon.maxContribution.toFixed(2)}%）：
                </div>

                {/* 主词条 */}
                {status.result.secondBestWeapon.bestMainStat && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">主词条</div>
                    <div className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-3 py-2">
                      <div className="font-medium">
                        {status.result.secondBestWeapon.bestMainStat.stat}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        满值：{CommonData.MAX_VALUES[status.result.secondBestWeapon.bestMainStat.stat] || '-'}
                        {CommonData.PERCENT_STATS.includes(status.result.secondBestWeapon.bestMainStat.stat) ? '%' : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* 副词条 */}
                {status.result.secondBestWeapon.bestSubStats?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      副词条（推荐{status.result.secondBestWeapon.bestSubStats.length}条）
                    </div>
                    <div className="space-y-2">
                      {status.result.secondBestWeapon.bestSubStats.map((stat: any, idx: number) => (
                        <div
                          key={stat.stat}
                          className="border-l-2 border-yellow-500/60 bg-background/60 rounded-r-md px-3 py-2"
                        >
                          <div className="font-medium">
                            {idx + 1}. {stat.stat}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            满值：{CommonData.MAX_VALUES[stat.stat] || '-'}
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
