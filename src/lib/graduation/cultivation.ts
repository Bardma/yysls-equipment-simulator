import { Calculator } from '@/lib/calculator';
import { CommonData } from '@/lib/data/commonData';
import type { EquipItem, EquippedItems } from '@/lib/types';

import { calcRateWithStatModifier } from './rate';

/**
 * 获取所有可能的词条
 */
export const getAllPossibleStats = (equippedItems: EquippedItems): string[] => {
  const excludedStats = [
    '指定武学增效',
    '剑武学增效',
    '枪武学增效',
    '伞武学增效',
    '扇武学增效',
    '绳标武学增效',
    '双刀武学增效',
    '陌刀武学增效',
    '横刀武学增效',
    '拳甲武学增效',
    '指定武学技能增伤',
    '外功穿透',
    '属攻穿透',
    '无相穿透',
    '最大无相攻击',
    '最小无相攻击',
  ];

  const allStats = Object.keys(CommonData.MAX_VALUES).filter(
    (stat) => !excludedStats.includes(stat)
  );

  if (equippedItems.weapon1 && equippedItems.weapon2) {
    const weaponTypeStat1 = CommonData.WEAPON_TYPES.find(
      (type) => type.id === equippedItems.weapon1?.weaponTypeId
    )?.stat;
    const weaponTypeStat2 = CommonData.WEAPON_TYPES.find(
      (type) => type.id === equippedItems.weapon2?.weaponTypeId
    )?.stat;
    if (weaponTypeStat1) allStats.push(weaponTypeStat1);
    if (weaponTypeStat2) allStats.push(weaponTypeStat2);
  }

  return allStats;
};

interface BestStatsResult {
  bestRate: number;
  bestMainStat: {
    stat: string;
    value: number;
    isPercent: boolean;
    diff: number;
  } | null;
  bestSubStats: Array<{
    stat: string;
    value: number;
    isPercent: boolean;
    diff: number;
  }>;
}

/**
 * 异步查找槽位的最佳词条
 */
export const findBestStatsForSlotAsync = async (
  slotKey: keyof EquippedItems,
  equip: EquipItem,
  blankEquips: EquippedItems,
  currentClass: string,
  bowType: string,
  xinfa: string[],
  setType: string,
  skillDb: Record<string, any>,
  rotation: any[],
  baseline: number,
  blankRate: number,
  earlySeasonBonus: boolean,
  progressCallback?: (text: string) => void
): Promise<BestStatsResult> => {
  const slotId = equip.slotId;
  const mainStatRules = (CommonData.MAIN_STAT_RULES[slotId] || []).filter(
    (stat) => stat !== '生存类词条' && stat !== '生存向'
  );

  const blankEquip = {
    id: `${equip.id}_blank`,
    slotId,
    slotName: equip.slotName,
    name: equip.name,
    icon: equip.icon,
    isPurple: equip.isPurple,
    isChengyin: equip.isChengyin,
    isConvertible: equip.isConvertible,
    weaponTypeId: equip.weaponTypeId,
    dingyinStat: equip.dingyinStat ? JSON.parse(JSON.stringify(equip.dingyinStat)) : null,
    mainStat: null,
    subStats: [],
  } as unknown as EquipItem;

  let validSubStatCandidates = [...CommonData.BASE_SUB_STATS].filter(
    (stat) => stat !== '生存类词条' && stat !== '生存向'
  );

  if (slotId === '1' && equip.weaponTypeId) {
    const weaponTypeData = CommonData.WEAPON_TYPES.find((w) => w.id === equip.weaponTypeId);
    if (weaponTypeData?.stat) validSubStatCandidates.push(weaponTypeData.stat);
  }

  if (['3', '4'].includes(slotId)) validSubStatCandidates.push('全武学增效');
  if (['5', '6'].includes(slotId)) {
    validSubStatCandidates.push('单体类奇术增伤');
    validSubStatCandidates.push('群体类奇术增伤');
  }
  if (['7', '8'].includes(slotId)) validSubStatCandidates.push('对首领单位增伤');

  validSubStatCandidates = [...new Set(validSubStatCandidates)].filter(
    (stat) => stat !== '生存类词条' && stat !== '生存向'
  );

  validSubStatCandidates = validSubStatCandidates.filter(
    (stat) =>
      !stat.includes('鸣金') &&
      !stat.includes('裂石') &&
      !stat.includes('牵丝') &&
      !stat.includes('破竹') &&
      !stat.includes('最小无相')
  );

  if (currentClass.includes('鸣金')) {
    validSubStatCandidates.push('最大鸣金攻击');
    validSubStatCandidates.push('最小裂石攻击');
  }
  if (currentClass.includes('裂石')) {
    validSubStatCandidates.push('最大裂石攻击');
    validSubStatCandidates.push('最小鸣金攻击');
  }
  if (currentClass.includes('牵丝')) {
    validSubStatCandidates.push('最大牵丝攻击');
    validSubStatCandidates.push('最小鸣金攻击');
  }
  if (currentClass.includes('破竹')) {
    validSubStatCandidates.push('最大破竹攻击');
    validSubStatCandidates.push('最小鸣金攻击');
  }

  let bestMainStat: BestStatsResult['bestMainStat'] = null;
  let bestSubStats: BestStatsResult['bestSubStats'] = [];
  let bestRate = blankRate;

  const calcRateForEquip = (testEquip: EquipItem) => {
    const testEquips = { ...blankEquips, [slotKey]: testEquip };
    const params = calcRateWithStatModifier(
      testEquips,
      currentClass,
      bowType,
      xinfa,
      setType,
      null,
      earlySeasonBonus
    );
    const result = Calculator.calculateGraduationRate(params, skillDb, rotation, baseline, false);
    return parseFloat(result.graduationRate);
  };

  const buildEquip = (mainStatType: string, subStatTypes: string[]) => {
    const mainMaxValue = CommonData.MAX_VALUES[mainStatType];
    const isMainPercent = CommonData.PERCENT_STATS.includes(mainStatType);
    return {
      ...blankEquip,
      mainStat: { type: mainStatType, value: mainMaxValue, isPercent: isMainPercent },
      subStats: subStatTypes.map((stat) => ({
        type: stat,
        value: CommonData.MAX_VALUES[stat],
        isPercent: CommonData.PERCENT_STATS.includes(stat),
      })),
    } as EquipItem;
  };

  const effectiveSubCandidates = validSubStatCandidates.filter(
    (stat) => !!CommonData.MAX_VALUES[stat]
  );

  let totalCombinations = 0;
  for (const mainStatType of mainStatRules) {
    const mainMaxValue = CommonData.MAX_VALUES[mainStatType];
    if (!mainMaxValue) continue;
    const pickCount = Math.min(4, effectiveSubCandidates.length);
    if (pickCount < 4) totalCombinations += 1;
    else {
      const n = effectiveSubCandidates.length;
      totalCombinations += (n * (n - 1) * (n - 2) * (n - 3)) / 24;
    }
  }

  let checkedCombinations = 0;
  const batchSize = 50;

  for (let mainIdx = 0; mainIdx < mainStatRules.length; mainIdx++) {
    const mainStatType = mainStatRules[mainIdx];
    const mainMaxValue = CommonData.MAX_VALUES[mainStatType];
    if (!mainMaxValue) continue;

    progressCallback?.(`遍历主词条 ${mainIdx + 1}/${mainStatRules.length}: ${mainStatType}`);

    const mainOnlyRate = calcRateForEquip(buildEquip(mainStatType, []));
    const subCandidates = effectiveSubCandidates;

    if (!subCandidates.length) {
      if (mainOnlyRate > bestRate) {
        bestRate = mainOnlyRate;
        bestMainStat = {
          stat: mainStatType,
          value: mainMaxValue,
          isPercent: CommonData.PERCENT_STATS.includes(mainStatType),
          diff: mainOnlyRate - blankRate,
        };
        bestSubStats = [];
      }
      continue;
    }

    const pickCount = Math.min(4, subCandidates.length);
    let bestComboRateForMain = -Infinity;
    let bestComboTypesForMain: string[] | null = null;

    if (pickCount < 4) {
      const rate = calcRateForEquip(buildEquip(mainStatType, subCandidates));
      bestComboRateForMain = rate;
      bestComboTypesForMain = subCandidates.slice();
      checkedCombinations++;
    } else {
      const n = subCandidates.length;
      let batchCount = 0;

      for (let i = 0; i < n - 3; i++) {
        for (let j = i + 1; j < n - 2; j++) {
          for (let k = j + 1; k < n - 1; k++) {
            for (let m = k + 1; m < n; m++) {
              const combo = [
                subCandidates[i],
                subCandidates[j],
                subCandidates[k],
                subCandidates[m],
              ];
              const rate = calcRateForEquip(buildEquip(mainStatType, combo));

              if (rate > bestComboRateForMain) {
                bestComboRateForMain = rate;
                bestComboTypesForMain = combo;
              }

              checkedCombinations++;
              batchCount++;

              if (batchCount >= batchSize) {
                batchCount = 0;
                if (totalCombinations > 0) {
                  const progress = Math.min(100, (checkedCombinations / totalCombinations) * 100);
                  progressCallback?.(
                    `枚举组合中... ${checkedCombinations}/${totalCombinations} (${progress.toFixed(1)}%)`
                  );
                }
                await new Promise((resolve) => setTimeout(resolve, 0));
              }
            }
          }
        }
      }
    }

    if (bestComboRateForMain > bestRate && bestComboTypesForMain) {
      bestRate = bestComboRateForMain;
      bestMainStat = {
        stat: mainStatType,
        value: mainMaxValue,
        isPercent: CommonData.PERCENT_STATS.includes(mainStatType),
        diff: mainOnlyRate - blankRate,
      };

      const rateAll = bestComboRateForMain;
      const subStatsWithDiff = bestComboTypesForMain.map((statType) => {
        const without = bestComboTypesForMain!.filter((x) => x !== statType);
        const rateWithout = calcRateForEquip(buildEquip(mainStatType, without));
        return {
          stat: statType,
          value: CommonData.MAX_VALUES[statType],
          isPercent: CommonData.PERCENT_STATS.includes(statType),
          diff: rateAll - rateWithout,
        };
      });

      subStatsWithDiff.sort((a, b) => (b.diff || 0) - (a.diff || 0));
      bestSubStats = subStatsWithDiff;
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return { bestRate, bestMainStat, bestSubStats };
};
