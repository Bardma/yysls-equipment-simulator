'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import { calcRateWithStatModifier, getAllPossibleStats } from '@/lib/graduation';
import type { EquippedItems } from '@/lib/types';

interface StatPriorityTabProps {
  equippedItems: EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  currentRate: number;
}

interface StatPriorityResult {
  gains: Array<{ stat: string; diff: number }>;
  losses: Array<{ stat: string; diff: number }>;
}

export const StatPriorityTab = ({
  equippedItems,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  currentRate,
}: StatPriorityTabProps) => {
  const [result, setResult] = useState<StatPriorityResult | null>(null);

  const calculate = () => {
    const baseRate = currentRate;
    const allPossibleStats = getAllPossibleStats(equippedItems);
    const rotationConfig = ClassConfig.ROTATIONS[currentClass];
    const rotation = rotationConfig?.rotation || [];
    const baselineValue = rotationConfig?.baseline || 4244078.34;
    const skillDb = rotationConfig?.skillDatabase || {};

    const gainResults: Array<{ stat: string; diff: number }> = [];
    const lossResults: Array<{ stat: string; diff: number }> = [];

    const weapon1Sub = equippedItems.weapon1?.subStats || [];
    const weapon2Sub = equippedItems.weapon2?.subStats || [];

    allPossibleStats.forEach((statType) => {
      const maxValue = CommonData.MAX_VALUES[statType];
      if (!maxValue) return;

      const isPercent = CommonData.PERCENT_STATS.includes(statType);
      let statExist = false;

      if (statType.includes('武学增效') && statType !== '全武学增效') {
        if (
          weapon1Sub.find((sub) => sub.type === statType) ||
          weapon2Sub.find((sub) => sub.type === statType)
        ) {
          statExist = true;
        }
      }

      if (!statExist) {
        const gainParams = calcRateWithStatModifier(
          equippedItems,
          currentClass,
          bowType,
          xinfaLoadout,
          setType,
          { type: statType, value: maxValue, isPercent, operation: 'add' },
          earlySeasonBonus
        );
        const gainResult = Calculator.calculateGraduationRate(
          gainParams,
          skillDb,
          rotation,
          baselineValue,
          false
        );
        const gainRate = parseFloat(gainResult.graduationRate);
        gainResults.push({ stat: statType, diff: gainRate - baseRate });
      }

      if (statExist || !statType.includes('武学增效') || statType === '全武学增效') {
        const lossParams = calcRateWithStatModifier(
          equippedItems,
          currentClass,
          bowType,
          xinfaLoadout,
          setType,
          { type: statType, value: maxValue, isPercent, operation: 'remove' },
          earlySeasonBonus
        );
        const lossResult = Calculator.calculateGraduationRate(
          lossParams,
          skillDb,
          rotation,
          baselineValue,
          false
        );
        const lossRate = parseFloat(lossResult.graduationRate);
        lossResults.push({ stat: statType, diff: baseRate - lossRate });
      }
    });

    gainResults.sort((a, b) => b.diff - a.diff);
    lossResults.sort((a, b) => b.diff - a.diff);
    setResult({ gains: gainResults, losses: lossResults });
  };

  return (
    <div className="space-y-4">
      <Button onClick={calculate}>计算词条优先级</Button>

      {result ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 左侧 - 倒金字塔 */}
          <div className="space-y-1">
            <div className="text-sm font-medium mb-2">新增词条收益</div>
            {result.gains.slice(0, 30).map((item, index, arr) => {
              // 倒金字塔：第一行100%，最后一行最短
              const widthPercent = 100 - (index / (arr.length - 1 || 1)) * 60;
              return (
                <div key={item.stat} className="relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-red-500/20 rounded-sm"
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className="relative flex justify-between text-sm px-2 py-0.5">
                    <span>{item.stat}</span>
                    <span className={item.diff > 0 ? 'text-red-400' : 'text-green-400'}>
                      {item.diff > 0 ? '+' : ''}
                      {item.diff.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* 右侧 - 正金字塔 */}
          <div className="space-y-1">
            <div className="text-sm font-medium mb-2 text-right">扣除词条损失</div>
            {result.losses.slice(0, 30).map((item, index, arr) => {
              // 正金字塔：第一行最短，最后一行100%
              const widthPercent = 40 + (index / (arr.length - 1 || 1)) * 60;
              return (
                <div key={item.stat} className="relative">
                  <div
                    className="absolute inset-y-0 right-0 bg-green-500/20 rounded-sm"
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className="relative flex justify-between text-sm px-2 py-0.5">
                    <span>{item.stat}</span>
                    <span className={item.diff > 0 ? 'text-green-400' : 'text-red-400'}>
                      {item.diff > 0 ? '-' : '+'}
                      {Math.abs(item.diff).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">尚未计算。</div>
      )}
    </div>
  );
};
