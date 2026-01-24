'use client';

import { Button } from '@/components/ui/button';
import { CommonData } from '@/lib/data/commonData';
import { calcRate } from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';

interface ConvertTabProps {
  convertTarget: EquipItem | null;
  selectedSubIndex: number;
  onSubIndexChange: (index: number) => void;
  equippedItems: EquippedItems;
  selectedSlotKey: keyof EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  currentRate: number;
  onPickEquip: () => void;
}

export const ConvertTab = ({
  convertTarget,
  selectedSubIndex,
  onSubIndexChange,
  equippedItems,
  selectedSlotKey,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  currentRate,
  onPickEquip,
}: ConvertTabProps) => {
  if (!convertTarget) {
    return (
      <div className="text-muted-foreground py-10 text-center">
        当前部位未穿戴装备，请先穿戴或点击按钮选择装备
        <div className="mt-4">
          <Button onClick={onPickEquip}>选择/录入装备进行分析</Button>
        </div>
      </div>
    );
  }

  const armories = CommonData.TRANSMUTATION_POOLS;
  const isWeapon = convertTarget.slotId === '1';
  const isElemental = (name: string) =>
    name.includes('鸣金') ||
    name.includes('裂石') ||
    name.includes('牵丝') ||
    name.includes('破竹') ||
    name.includes('无相');
  const normalize = (name: string) =>
    isWeapon && isElemental(name) ? name.replace(/鸣金|裂石|牵丝|破竹/g, '无相') : name;

  const analysisByArmory = Object.entries(armories).map(([armoryName, pool]) => {
    let totalDiff = 0;
    let validCount = 0;
    const outcomes: Array<{ name: string; diff: number }> = [];

    let totalElementalCount = 0;
    convertTarget.subStats.forEach((sub) => {
      if (isElemental(normalize(sub.type))) totalElementalCount++;
    });

    const existingStats = new Set(
      convertTarget.subStats
        .map((sub, idx) => (idx === selectedSubIndex ? '' : normalize(sub.type)))
        .filter(Boolean)
    );
    const currentTargetStat = normalize(convertTarget.subStats[selectedSubIndex]?.type || '');

    pool.forEach((statName) => {
      const finalStatName = normalize(statName);
      if (isElemental(finalStatName) && totalElementalCount >= 2) return;
      if (existingStats.has(finalStatName)) return;
      if (finalStatName === currentTargetStat) return;

      const maxVal = CommonData.MAX_VALUES[finalStatName];
      if (!maxVal) return;

      const testEquip = JSON.parse(JSON.stringify(convertTarget)) as EquipItem;
      testEquip.subStats[selectedSubIndex] = {
        type: finalStatName,
        value: maxVal,
        isPercent: CommonData.PERCENT_STATS.includes(finalStatName),
      };

      const testLoadout = { ...equippedItems, [selectedSlotKey]: testEquip };
      const res = calcRate(
        testLoadout,
        currentClass,
        bowType,
        xinfaLoadout,
        setType,
        earlySeasonBonus
      );
      const newRate = parseFloat(res.graduationRate);
      const diff = newRate - currentRate;

      totalDiff += diff;
      validCount++;
      outcomes.push({ name: finalStatName, diff });
    });

    outcomes.sort((a, b) => b.diff - a.diff);
    const expected = validCount > 0 ? totalDiff / validCount : 0;
    return { armoryName, expected, outcomes };
  });

  return (
    <div className="space-y-4">
      <div className="border-border/60 bg-card flex items-center justify-between rounded-lg border p-3">
        <div className="text-muted-foreground text-sm">分析对象</div>
        <div className="font-medium">{convertTarget.name}</div>
        <Button size="sm" variant="secondary" onClick={onPickEquip}>
          更换分析对象
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {convertTarget.subStats.map((sub, idx) => (
          <button
            key={`${sub.type}-${idx}`}
            className={`rounded-md border px-3 py-1 text-sm ${
              idx === selectedSubIndex
                ? 'border-primary text-primary'
                : 'border-border/60 text-muted-foreground'
            }`}
            onClick={() => onSubIndexChange(idx)}
          >
            {sub.type}+{sub.value}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {analysisByArmory.map((armory) => (
          <div key={armory.armoryName} className="border-border/60 bg-card rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{armory.armoryName}</div>
              <div
                className={`text-sm ${
                  armory.expected > 0
                    ? 'text-red-400'
                    : armory.expected < 0
                      ? 'text-green-400'
                      : 'text-muted-foreground'
                }`}
              >
                期望 {armory.expected > 0 ? '+' : ''}
                {armory.expected.toFixed(2)}%
              </div>
            </div>
            <div className="text-muted-foreground mt-2 space-y-1 text-xs">
              {armory.outcomes.map((outcome) => (
                <div key={outcome.name} className="flex items-center justify-between">
                  <span>{outcome.name}</span>
                  <span
                    className={
                      outcome.diff > 0 ? 'text-red-400' : outcome.diff < 0 ? 'text-green-400' : ''
                    }
                  >
                    {outcome.diff > 0 ? '+' : ''}
                    {outcome.diff.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
