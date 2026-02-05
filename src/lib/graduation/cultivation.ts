import { Calculator } from '@/lib/calculator';
import { CommonData } from '@/lib/data/commonData';
import type { EquipItem, EquippedItems } from '@/lib/types';

import { calcRateWithStatModifier } from './rate';

/**
 * HuoQuSuoYouKeNengDeAffix
 */
export const getAllPossibleStats = (equippedItems: EquippedItems): string[] => {
  const excludedStats = [
    'Specific Martial Art Effectiveness',
    'Sword Martial Art Effectiveness',
    'Spear Martial Art Effectiveness',
    'Umbrella Martial Art Effectiveness',
    'Fan Martial Art Effectiveness',
    'Rope Dart Martial Art Effectiveness',
    'Dual Blades Martial Art Effectiveness',
    'Great Blade Martial Art Effectiveness',
    'Sabre Martial Art Effectiveness',
    'Fist Martial Art Effectiveness',
    'Specific Skill Damage Bonus',
    'Outer Penetration',
    'Elemental Penetration',
    'NoneXiang Penetration',
    'ZuiDaNoneXiangGongJi',
    'ZuiXiaoNoneXiangGongJi',
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
 * YiBuChaZhaoCaoWeiDeZuiJiaAffix
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
    (stat) => stat !== 'ShengCunLeiAffix' && stat !== 'ShengCunXiang'
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
    (stat) => stat !== 'ShengCunLeiAffix' && stat !== 'ShengCunXiang'
  );

  if (slotId === '1' && equip.weaponTypeId) {
    const weaponTypeData = CommonData.WEAPON_TYPES.find((w) => w.id === equip.weaponTypeId);
    if (weaponTypeData?.stat) validSubStatCandidates.push(weaponTypeData.stat);
  }

  if (['3', '4'].includes(slotId)) validSubStatCandidates.push('All Martial Arts Effectiveness');
  if (['5', '6'].includes(slotId)) {
    validSubStatCandidates.push('Singletarget Technique Damage Bonus');
    validSubStatCandidates.push('AoE Technique Damage Bonus');
  }
  if (['7', '8'].includes(slotId)) validSubStatCandidates.push('Boss Damage Bonus');

  validSubStatCandidates = [...new Set(validSubStatCandidates)].filter(
    (stat) => stat !== 'ShengCunLeiAffix' && stat !== 'ShengCunXiang'
  );

  validSubStatCandidates = validSubStatCandidates.filter(
    (stat) =>
      !stat.includes('MingJin') &&
      !stat.includes('LieShi') &&
      !stat.includes('QianSi') &&
      !stat.includes('PoZhu') &&
      !stat.includes('ZuiXiaoNoneXiang')
  );

  if (currentClass.includes('MingJin')) {
    validSubStatCandidates.push('Max Mingjin Attack');
    validSubStatCandidates.push('Min Lie Shi Attack');
  }
  if (currentClass.includes('LieShi')) {
    validSubStatCandidates.push('Max Lie Shi Attack');
    validSubStatCandidates.push('Min Mingjin Attack');
  }
  if (currentClass.includes('QianSi')) {
    validSubStatCandidates.push('Max Qian Si Attack');
    validSubStatCandidates.push('Min Mingjin Attack');
  }
  if (currentClass.includes('PoZhu')) {
    validSubStatCandidates.push('Max Po Zhu Attack');
    validSubStatCandidates.push('Min Mingjin Attack');
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

    progressCallback?.(`BianLiPrimary Affix ${mainIdx + 1}/${mainStatRules.length}: ${mainStatType}`);

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
                    `MeiJuZuHeZhong... ${checkedCombinations}/${totalCombinations} (${progress.toFixed(1)}%)`
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
