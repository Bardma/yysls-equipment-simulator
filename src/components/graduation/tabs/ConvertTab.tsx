'use client';

import { Button } from '@/components/ui/button';
import { CommonData } from '@/lib/data/commonData';
import { calcRate } from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';
import { statLabel } from '@/lib/statName';

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
        No equipment is worn in the current slot. Equip one first or choose an item to analyze.
        <div className="mt-4">
          <Button onClick={onPickEquip}>Choose/Add Equipment for Analysis</Button>
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

  const baselineEquip = equippedItems[selectedSlotKey];

  const bestRecommendation = (() => {
    let best = {
      expectedDiff: -999,
      subIndex: -1,
      armories: [] as string[],
      stat: '',
      originalStat: '',
      maxDiff: -999,
      hasPositiveCase: false,
      positiveCases: [] as Array<{
        subIndex: number;
        armory: string;
        stat: string;
        originalStat: string;
        maxDiff: number;
        expectedDiff: number;
      }>,
    };

    for (let subIndex = 0; subIndex < convertTarget.subStats.length; subIndex++) {
      let totalElementalCount = 0;
      convertTarget.subStats.forEach((sub) => {
        if (isElemental(normalize(sub.type))) totalElementalCount++;
      });

      const existingStats = new Set<string>();
      convertTarget.subStats.forEach((sub, idx) => {
        if (idx !== subIndex) existingStats.add(normalize(sub.type));
      });

      const currentTargetStat = normalize(convertTarget.subStats[subIndex].type);

      for (const [armoryName, pool] of Object.entries(armories)) {
        let totalDiff = 0;
        let validCount = 0;
        let maxDiff = -999;
        let bestStat = '';

        pool.forEach((statName) => {
          const finalStatName = normalize(statName);
          if (isElemental(finalStatName) && totalElementalCount >= 2) return;
          if (existingStats.has(finalStatName)) return;
          if (finalStatName === currentTargetStat) return;

          const maxVal = CommonData.MAX_VALUES[finalStatName];
          if (!maxVal) return;

          const testEquip = JSON.parse(JSON.stringify(convertTarget)) as EquipItem;
          testEquip.subStats[subIndex] = {
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
          if (diff > maxDiff) {
            maxDiff = diff;
            bestStat = finalStatName;
          }
        });

        if (validCount > 0) {
          const expectedDiff = totalDiff / validCount;
          const hasPositive = maxDiff > 0.0001;

          if (hasPositive && expectedDiff <= 0.0001) {
            if (!best.hasPositiveCase || expectedDiff > best.expectedDiff) {
              best.hasPositiveCase = true;
              best.positiveCases = [
                {
                  subIndex,
                  armory: armoryName,
                  stat: bestStat,
                  originalStat: convertTarget.subStats[subIndex].type,
                  maxDiff,
                  expectedDiff,
                },
              ];
            } else if (Math.abs(expectedDiff - best.expectedDiff) < 0.0001) {
              const exists = best.positiveCases.some(
                (c) => c.subIndex === subIndex && c.armory === armoryName
              );
              if (!exists) {
                best.positiveCases.push({
                  subIndex,
                  armory: armoryName,
                  stat: bestStat,
                  originalStat: convertTarget.subStats[subIndex].type,
                  maxDiff,
                  expectedDiff,
                });
              }
            }
          }

          if (
            expectedDiff > best.expectedDiff ||
            (Math.abs(expectedDiff - best.expectedDiff) < 0.0001 && maxDiff > best.maxDiff)
          ) {
            if (expectedDiff > 0.0001) {
              best.hasPositiveCase = false;
              best.positiveCases = [];
            }
            best.expectedDiff = expectedDiff;
            best.subIndex = subIndex;
            best.armories = [armoryName];
            best.stat = bestStat;
            best.originalStat = convertTarget.subStats[subIndex].type;
            best.maxDiff = maxDiff;
          } else if (
            Math.abs(expectedDiff - best.expectedDiff) < 0.0001 &&
            Math.abs(maxDiff - best.maxDiff) < 0.0001 &&
            subIndex === best.subIndex
          ) {
            if (!best.armories.includes(armoryName)) {
              best.armories.push(armoryName);
            }
          }
        }
      }
    }

    if (best.expectedDiff > -999) return best;
    if (best.hasPositiveCase && best.positiveCases.length > 0) return best;
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="border-border/60 bg-card space-y-2 rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">Baseline (currently equipped)</div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="font-medium">
              {baselineEquip?.name || 'Unequipped'}
            </div>
            {baselineEquip?.isChengyin ? (
              <span className="text-[10px] text-muted-foreground">(Chengyin)</span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground text-xs">Analysis Target</div>
            <div className="font-medium">{convertTarget.name}</div>
            <Button size="sm" variant="secondary" onClick={onPickEquip}>
              Change Analysis Target
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {convertTarget.subStats.map((sub, idx) => (
          <button
            key={`${sub.type}-${idx}`}
            className={`rounded-md border px-3 py-1.5 text-sm transition-all ${
              idx === selectedSubIndex
                ? 'border-primary bg-primary/20 text-primary font-medium'
                : 'border-border/40 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border'
            }`}
            onClick={() => onSubIndexChange(idx)}
          >
            {statLabel(sub.type)}+{sub.value}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {analysisByArmory.map((armory) => (
          <div key={armory.armoryName} className="border-border/60 bg-card rounded-lg border p-2">
            <div className="flex items-center justify-between gap-1">
              <div className="text-sm font-medium truncate">{armory.armoryName}</div>
              <div
                className={`text-xs shrink-0 ${
                  armory.expected > 0
                    ? 'text-red-400'
                    : armory.expected < 0
                      ? 'text-green-400'
                      : 'text-muted-foreground'
                }`}
              >
                <span className="hidden sm:inline">Expected </span>{armory.expected > 0 ? '+' : ''}
                {armory.expected.toFixed(2)}%
              </div>
            </div>
            <div className="text-muted-foreground mt-1.5 space-y-0.5 text-xs">
              {armory.outcomes.map((outcome) => (
                <div key={outcome.name} className="flex items-center justify-between">
                  <span className="truncate">{statLabel(outcome.name)}</span>
                  <span
                    className={`shrink-0 ml-1 ${
                      outcome.diff > 0 ? 'text-red-400' : outcome.diff < 0 ? 'text-green-400' : ''
                    }`}
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

      {bestRecommendation ? (
        bestRecommendation.expectedDiff > 0.0001 ? (
          <div className="border-green-500/40 bg-green-500/10 rounded-lg border px-4 py-3 text-sm text-green-200">
            <div className="font-semibold mb-1">✅ Recommended Transmutation</div>
            <div>
              Recommended: convert Sub Stat #{bestRecommendation.subIndex + 1}
              <span className="mx-1 font-semibold">{statLabel(bestRecommendation.originalStat)}</span>
              to
              <span className="mx-1 font-semibold">{statLabel(bestRecommendation.stat)}</span>
              using
              <span className="mx-1 font-semibold">
                {bestRecommendation.armories.length > 1
                  ? bestRecommendation.armories.join(', ')
                  : bestRecommendation.armories[0]}
              </span>
              ; expected gain
              <span className="mx-1 font-semibold">
                +{bestRecommendation.expectedDiff.toFixed(2)}%
              </span>
              ; max gain
              <span className="mx-1 font-semibold">
                +{bestRecommendation.maxDiff.toFixed(2)}%
              </span>
              (better than current equipped item).
            </div>
          </div>
        ) : bestRecommendation.hasPositiveCase && bestRecommendation.positiveCases.length > 0 ? (
          <div className="border-yellow-500/40 bg-yellow-500/10 rounded-lg border px-4 py-3 text-sm text-yellow-200">
            <div className="font-semibold mb-1">⚠️ Transmute with Caution</div>
            <div>
              Although expected gains are negative across all armories, some cases can still improve graduation rate:
            </div>
            <div className="mt-1">
              {Array.from(
                new Map(
                  bestRecommendation.positiveCases.map((c) => [
                    `${c.subIndex}_${c.stat}`,
                    {
                      subIndex: c.subIndex,
                      stat: c.stat,
                      originalStat: c.originalStat,
                      armories: [] as string[],
                    },
                  ])
                ).values()
              ).map((group) => {
                bestRecommendation.positiveCases.forEach((c) => {
                  if (c.subIndex === group.subIndex && c.stat === group.stat) {
                    if (!group.armories.includes(c.armory)) group.armories.push(c.armory);
                  }
                });
                return (
                  <div key={`${group.subIndex}-${statLabel(group.stat)}`}>
                    Convert Sub Stat #{group.subIndex + 1} {statLabel(group.originalStat)} to {statLabel(group.stat)}, 
                    using {group.armories.length > 1 ? group.armories.join('/') : group.armories[0]} armory
                  </div>
                );
              })}
            </div>
            <div className="mt-2">
              Highest possible gain
              <span className="mx-1 font-semibold">
                +{bestRecommendation.positiveCases[0].maxDiff.toFixed(2)}%
              </span>
              but expected gain is only
              <span className="mx-1 font-semibold">
                {bestRecommendation.positiveCases[0].expectedDiff.toFixed(2)}%
              </span>
              please evaluate carefully.
            </div>
          </div>
        ) : (
          <div className="border-red-500/40 bg-red-500/10 rounded-lg border px-4 py-3 text-sm text-red-200">
            <div className="font-semibold mb-1">⛔ Transmutation Not Recommended</div>
            <div>
              Analysis result: no sub-stat transmutation can outperform the currently equipped item.
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              (maximum expected gain is {bestRecommendation.expectedDiff.toFixed(2)}% or negative)
            </div>
          </div>
        )
      ) : null}
    </div>
  );
};
