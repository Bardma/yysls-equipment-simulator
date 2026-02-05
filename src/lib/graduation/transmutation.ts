import { CommonData } from '@/lib/data/commonData';
import type { EquipItem, EquippedItems } from '@/lib/types';

import { addFullDingyinToEquips } from './dingyin';
import { calculateBuildRate } from './rate';

export const SLOT_NAME_MAP: Record<keyof EquippedItems, string> = {
  weapon1: 'Weapon 1',
  weapon2: 'Weapon 2',
  head: 'Head',
  chest: 'Chest',
  ring: 'Ring',
  pendant: 'Pendant',
  legs: 'Legs',
  hands: 'Hands',
};

/**
 * 获取装备的转律变体
 */
export const getTransmutationVariants = (
  equip: EquipItem,
  currentClass: string
): Array<{
  variant: EquipItem;
  subIndex: number;
  fromStat: string;
  toStat: string;
}> => {
  if (!equip.isConvertible) return [];

  const armories = CommonData.TRANSMUTATION_POOLS;
  let armoryPool: string[] | null = null;

  if (currentClass === '破竹尘' || currentClass === '破竹鸢') {
    armoryPool = armories['破竹武库'];
  } else if (currentClass.includes('鸣金')) {
    armoryPool = armories['鸣金武库'];
  } else if (currentClass.includes('裂石')) {
    armoryPool = armories['裂石武库'];
  } else if (currentClass.includes('牵丝')) {
    armoryPool = armories['牵丝武库'];
  }

  if (!armoryPool) return [];

  const variants: Array<{
    variant: EquipItem;
    subIndex: number;
    fromStat: string;
    toStat: string;
  }> = [];

  for (let subIndex = 0; subIndex < equip.subStats.length; subIndex++) {
    const currentSub = equip.subStats[subIndex];
    const existingTypes = new Set<string>();

    equip.subStats.forEach((sub, idx) => {
      if (idx !== subIndex) existingTypes.add(sub.type);
    });

    for (const newStatType of armoryPool) {
      if (newStatType === currentSub.type || existingTypes.has(newStatType)) continue;

      const variant = JSON.parse(JSON.stringify(equip)) as EquipItem;
      variant.id = `${equip.id}_trans_${subIndex}_${newStatType}`;
      variant.subStats[subIndex] = {
        type: newStatType,
        value: parseFloat((CommonData.MAX_VALUES[newStatType] * 0.94).toFixed(1)),
        isPercent: CommonData.PERCENT_STATS.includes(newStatType),
      };

      variants.push({
        variant,
        subIndex,
        fromStat: currentSub.type,
        toStat: newStatType,
      });
    }
  }

  return variants;
};

export interface TransmutationResult {
  equippedItems: EquippedItems | null;
  rate: number;
  damage: number;
  transmutations: Array<{
    equipName: string;
    slotName: string;
    fromStat: string;
    toStat: string;
  }>;
}

/**
 * 寻找最佳转律方案
 */
export const findBestTransmutation = (
  baseEquipped: EquippedItems,
  convertibleEquips: Array<{ slotKey: keyof EquippedItems; equip: EquipItem }>,
  currentClass: string,
  bowType: string,
  setType: string,
  xinfa: string[],
  earlySeasonBonus: boolean,
  minIntentRate?: number | null
): TransmutationResult => {
  if (!convertibleEquips.length) {
    return { equippedItems: null, rate: 0, damage: 0, transmutations: [] };
  }

  let bestResult: TransmutationResult = {
    equippedItems: null,
    rate: 0,
    damage: 0,
    transmutations: [],
  };

  const traverse = (
    currentEquipped: EquippedItems,
    equipIndex: number,
    transmutations: TransmutationResult['transmutations']
  ) => {
    if (equipIndex >= convertibleEquips.length) {
      if (minIntentRate !== null && minIntentRate !== undefined) {
        const equipsWithDingyin = addFullDingyinToEquips(currentEquipped);
        const { Calculator } = require('@/lib/calculator');
        const totals = Calculator.calculateTotal(
          equipsWithDingyin,
          currentClass,
          bowType,
          xinfa,
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
        xinfa,
        earlySeasonBonus,
        addFullDingyinToEquips
      );

      if (result.rate > bestResult.rate) {
        bestResult = {
          equippedItems: addFullDingyinToEquips(currentEquipped),
          rate: result.rate,
          damage: result.damage,
          transmutations: [...transmutations],
        };
      }
      return;
    }

    const { slotKey, equip } = convertibleEquips[equipIndex];
    const variants = getTransmutationVariants(equip, currentClass);

    traverse({ ...currentEquipped }, equipIndex + 1, transmutations);

    variants.forEach(({ variant, fromStat, toStat }) => {
      const newEquipped = { ...currentEquipped, [slotKey]: variant };
      const nextTrans = [
        ...transmutations,
        { equipName: equip.name, slotName: SLOT_NAME_MAP[slotKey], fromStat, toStat },
      ];
      traverse(newEquipped, equipIndex + 1, nextTrans);
    });
  };

  traverse(baseEquipped, 0, []);
  return bestResult;
};
