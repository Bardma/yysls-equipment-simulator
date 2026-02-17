'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import {
  addFullDingyinToEquips,
  calculateBuildRate,
  createChengyinVersion,
  findBestTransmutation,
  getEquipAveragePercent,
  isChengyinEquip,
  SLOT_NAME_MAP,
} from '@/lib/graduation';
import type { EquipItem, EquippedItems } from '@/lib/types';

interface BestBuildTabProps {
  db: EquipItem[];
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  onApplyBuild: (equips: EquippedItems) => void;
}

interface BuildResult {
  buildA: {
    equippedItems: EquippedItems | null;
    rate: number;
    damage: number;
  };
  buildB: {
    equippedItems: EquippedItems | null;
    rate: number;
    damage: number;
    transmutations: any[];
  } | null;
  checkedCount: number;
}

export const BestBuildTab = ({
  db,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  onApplyBuild,
}: BestBuildTabProps) => {
  const [status, setStatus] = useState<{
    running: boolean;
    text: string;
    percent: number;
    result: BuildResult | null;
  }>({ running: false, text: '', percent: 0, result: null });

  const startBestBuild = async () => {
    if (!currentClass) return;

    let minIntentRate: number | null = null;
    if (setType === '飞隼') {
      const input = window.prompt('Current set is Hawkwing. Enter minimum Affinity Rate (0-100)', '20');
      if (input === null) return;
      const parsed = parseFloat(input);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert('Please enter a valid value between 0 and 100');
        return;
      }
      minIntentRate = parsed;
    }

    setStatus({ running: true, text: 'Preparing equipment data...', percent: 0, result: null });
    Calculator.clearCache();

    const allowedWeapons = ClassConfig.WEAPON_RULES[currentClass] || [];
    const equipBySlot: Record<keyof EquippedItems, EquipItem[]> = {
      weapon1: [],
      weapon2: [],
      head: [],
      chest: [],
      ring: [],
      pendant: [],
      legs: [],
      hands: [],
    };

    db.forEach((equip) => {
      if (equip.slotId === '1') {
        if (equip.weaponTypeId && allowedWeapons.includes(equip.weaponTypeId)) {
          equipBySlot.weapon1.push(equip);
          equipBySlot.weapon2.push(equip);
        }
      } else {
        const slotKey = {
          '3': 'ring',
          '4': 'pendant',
          '5': 'head',
          '6': 'chest',
          '7': 'legs',
          '8': 'hands',
        }[equip.slotId] as keyof EquippedItems | undefined;
        if (slotKey) equipBySlot[slotKey].push(equip);
      }
    });

    const candidates: Record<keyof EquippedItems, EquipItem[]> = {
      weapon1: [],
      weapon2: [],
      head: [],
      chest: [],
      ring: [],
      pendant: [],
      legs: [],
      hands: [],
    };

    (Object.keys(equipBySlot) as Array<keyof EquippedItems>).forEach((slotKey) => {
      equipBySlot[slotKey].forEach((equip) => {
        if (isChengyinEquip(equip)) {
          candidates[slotKey].push(equip);
        } else {
          const avg = getEquipAveragePercent(equip);
          if (avg < 0.87) {
            candidates[slotKey].push(createChengyinVersion(equip));
          } else {
            candidates[slotKey].push(equip);
            candidates[slotKey].push(createChengyinVersion(equip));
          }
        }
      });
    });

    let totalCombinations = 1;
    (Object.keys(candidates) as Array<keyof EquippedItems>).forEach((slotKey) => {
      totalCombinations *= Math.max(1, candidates[slotKey].length);
    });

    const slots: Array<keyof EquippedItems> = [
      'weapon1',
      'weapon2',
      'head',
      'chest',
      'ring',
      'pendant',
      'legs',
      'hands',
    ];

    let checkedCount = 0;
    let bestBuildA = { equippedItems: null as EquippedItems | null, rate: 0, damage: 0 };
    let bestBuildB = {
      equippedItems: null as EquippedItems | null,
      rate: 0,
      damage: 0,
      transmutations: [] as any[],
    };

    function* combinationGenerator() {
      const stack: Array<{ equipped: EquippedItems; slotIndex: number }> = [
        {
          equipped: {
            weapon1: null,
            weapon2: null,
            head: null,
            chest: null,
            ring: null,
            pendant: null,
            legs: null,
            hands: null,
          },
          slotIndex: 0,
        },
      ];
      while (stack.length) {
        const { equipped, slotIndex } = stack.pop()!;
        if (slotIndex >= slots.length) {
          yield equipped;
          continue;
        }
        const slotKey = slots[slotIndex];
        const slotCandidates = candidates[slotKey] || [];
        if (slotCandidates.length === 0) {
          stack.push({ equipped, slotIndex: slotIndex + 1 });
          continue;
        }
        if (slotKey === 'weapon2' && equipped.weapon1) {
          const w1Type = equipped.weapon1.weaponTypeId;
          for (let i = slotCandidates.length - 1; i >= 0; i--) {
            const candidate = slotCandidates[i];
            if (candidate.weaponTypeId !== w1Type) {
              const next = { ...equipped, [slotKey]: candidate } as EquippedItems;
              stack.push({ equipped: next, slotIndex: slotIndex + 1 });
            }
          }
        } else {
          for (let i = slotCandidates.length - 1; i >= 0; i--) {
            const candidate = slotCandidates[i];
            const next = { ...equipped, [slotKey]: candidate } as EquippedItems;
            stack.push({ equipped: next, slotIndex: slotIndex + 1 });
          }
        }
      }
    }

    const generator = combinationGenerator();
    const workQueue: EquippedItems[] = [];
    const MAX_QUEUE_SIZE = 1000;
    const BATCH_SIZE = 50;
    let generatorExhausted = false;

    const fillQueue = () => {
      if (generatorExhausted || workQueue.length >= MAX_QUEUE_SIZE) return;
      while (workQueue.length < MAX_QUEUE_SIZE) {
        const next = generator.next();
        if (next.done) {
          generatorExhausted = true;
          break;
        }
        workQueue.push(next.value);
      }
    };

    const processCombination = (currentEquipped: EquippedItems) => {
      checkedCount++;
      if (minIntentRate !== null && minIntentRate !== undefined) {
        const equipsWithDingyin = addFullDingyinToEquips(currentEquipped);
        const totals = Calculator.calculateTotal(
          equipsWithDingyin,
          currentClass,
          bowType,
          xinfaLoadout,
          setType,
          false,
          null,
          earlySeasonBonus
        );
        const intentRate =
          totals['实际会意率'] !== undefined ? totals['实际会意率'] : totals['会意率'] || 0;
        if (intentRate < minIntentRate) return;
      }

      const result = calculateBuildRate(
        currentEquipped,
        currentClass,
        bowType,
        setType,
        xinfaLoadout,
        earlySeasonBonus,
        addFullDingyinToEquips
      );

      if (result.rate > bestBuildA.rate) {
        bestBuildA = {
          equippedItems: addFullDingyinToEquips(currentEquipped),
          rate: result.rate,
          damage: result.damage,
        };
      }

      if (result.rate >= bestBuildA.rate * 0.95) {
        const convertibleEquips = Object.entries(currentEquipped)
          .filter(([, equip]) => equip && (equip as EquipItem).isConvertible)
          .map(([slotKey, equip]) => ({
            slotKey: slotKey as keyof EquippedItems,
            equip: equip as EquipItem,
          }));

        if (convertibleEquips.length) {
          const transResult = findBestTransmutation(
            currentEquipped,
            convertibleEquips,
            currentClass,
            bowType,
            setType,
            xinfaLoadout,
            earlySeasonBonus,
            minIntentRate
          );
          if (transResult.rate > bestBuildB.rate) {
            bestBuildB = transResult;
          }
        }
      }
    };

    await new Promise<void>((resolve) => {
      const processBatch = () => {
        if (workQueue.length === 0 && generatorExhausted) {
          setStatus({
            running: false,
            text: 'Calculation complete!',
            percent: 100,
            result: {
              buildA: bestBuildA,
              buildB: bestBuildB.rate > bestBuildA.rate ? bestBuildB : null,
              checkedCount,
            },
          });
          resolve();
          return;
        }
        if (workQueue.length < MAX_QUEUE_SIZE / 2 && !generatorExhausted) fillQueue();
        const start = Date.now();
        let batchCount = 0;
        while (workQueue.length && batchCount < BATCH_SIZE && Date.now() - start < 16) {
          const combo = workQueue.shift()!;
          processCombination(combo);
          batchCount++;
        }
        const percent = totalCombinations
          ? Math.min(100, (checkedCount / totalCombinations) * 100)
          : 0;
        setStatus({
          running: true,
          text: `Checked ${checkedCount} / ${totalCombinations} combinations`,
          percent,
          result: null,
        });
        setTimeout(processBatch, 0);
      };
      fillQueue();
      processBatch();
    });
  };

  const renderEquipList = (equips: EquippedItems) => {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {(Object.keys(SLOT_NAME_MAP) as Array<keyof EquippedItems>).map((slotKey) => {
          const equip = equips[slotKey];
          return (
            <div key={slotKey} className="border-border/60 bg-card rounded-md border p-2 text-xs">
              <div className="font-medium">{SLOT_NAME_MAP[slotKey]}</div>
              <div className="text-muted-foreground">{equip ? equip.name : '(Empty)'}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Best Build scans all possible combinations in the database (with full borrowed attunement) to find the highest graduation rate.
      </p>
      <Button onClick={startBestBuild} disabled={status.running}>
        {status.running ? 'Calculating...' : 'Start Best Build Search'}
      </Button>

      {status.running && (
        <div className="text-muted-foreground text-sm">
          {status.text} ({status.percent.toFixed(1)}%)
        </div>
      )}

      {status.result && (
        <div className="space-y-4">
          <div className="border-border/60 bg-card rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">Best Build</div>
              <Button
                size="sm"
                onClick={() => onApplyBuild(status.result!.buildA.equippedItems!)}
              >
                Use this build
              </Button>
            </div>
            <div className="text-muted-foreground mt-2 text-sm">
              Graduation Rate {status.result.buildA.rate.toFixed(2)}%
            </div>
            <div className="mt-3">{renderEquipList(status.result.buildA.equippedItems!)}</div>
          </div>

          {status.result.buildB && (
            <div className="border-border/60 bg-card rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Best Build After Transmutation</div>
                <Button
                  size="sm"
                  onClick={() => onApplyBuild(status.result!.buildB!.equippedItems!)}
                >
                  Use this build
                </Button>
              </div>
              <div className="text-muted-foreground mt-2 text-sm">
                Graduation Rate {status.result.buildB.rate.toFixed(2)}%
              </div>
              <div className="mt-3">{renderEquipList(status.result.buildB.equippedItems!)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
