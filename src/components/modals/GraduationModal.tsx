'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';

import { Calculator } from '../../lib/calculator';
import { ClassConfig } from '../../lib/data/classConfig';
import { CommonData } from '../../lib/data/commonData';
import type { EquipItem, EquippedItems } from '../../lib/types';
import type { CalculatorStatModifier } from '../../lib/types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EquipPickerModal } from './EquipPickerModal';

interface GraduationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  db: EquipItem[];
  equippedItems: EquippedItems;
  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  onApplyBuild: (equips: EquippedItems) => void;
}

const slotKeyMap: Record<string, keyof EquippedItems> = {
  weapon1: 'weapon1',
  weapon2: 'weapon2',
  head: 'head',
  chest: 'chest',
  ring: 'ring',
  pendant: 'pendant',
  legs: 'legs',
  hands: 'hands',
};

const slotNameMap: Record<keyof EquippedItems, string> = {
  weapon1: '武器1',
  weapon2: '武器2',
  head: '冠胄',
  chest: '胸甲',
  ring: '环',
  pendant: '佩',
  legs: '胫甲',
  hands: '腕甲',
};

const getScore = (equip: EquipItem) => {
  let totalPct = 0;
  let count = 0;
  if (equip.mainStat && equip.mainStat.type !== '生存类词条' && equip.mainStat.type !== '生存向') {
    const mMax = CommonData.MAX_VALUES[equip.mainStat.type];
    if (mMax) {
      totalPct += equip.mainStat.value / mMax;
      count++;
    }
  }
  equip.subStats.forEach((s) => {
    if (s.type !== '生存类词条' && s.type !== '生存向') {
      const sMax = CommonData.MAX_VALUES[s.type];
      if (sMax) {
        totalPct += s.value / sMax;
        count++;
      }
    }
  });
  return count > 0 ? `${((totalPct / count) * 100).toFixed(1)}%` : '0.0%';
};

const calcRate = (
  equips: EquippedItems,
  currentClass: string,
  bowType: string,
  xinfa: string[],
  setType: string,
  earlySeasonBonus: boolean
) => {
  const totals = Calculator.calculateTotal(
    equips,
    currentClass,
    bowType,
    xinfa,
    setType,
    false,
    null,
    earlySeasonBonus
  );
  for (const key in totals) {
    const val = totals[key];
    const isPercent =
      CommonData.PERCENT_STATS.includes(key) ||
      key.includes('率') ||
      key.includes('增效') ||
      key.includes('加成') ||
      key.includes('增伤');
    const isPenetration = key.includes('穿透');
    totals[key] = isPercent || isPenetration ? parseFloat(val.toFixed(1)) : Math.round(val);
  }
  const calcParams = { ...totals, 套装: setType, 心法: xinfa, 当前流派: currentClass };
  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  const skillDb = rotationConfig?.skillDatabase || {};
  const rotation = rotationConfig?.rotation || [];
  const baseline = rotationConfig?.baseline || 4244078.34;
  if (!rotation.length) return { graduationRate: '0.00%', totalDamage: 0 };
  return Calculator.calculateGraduationRate(calcParams, skillDb, rotation, baseline, false);
};

const calcRateWithStatModifier = (
  equips: EquippedItems,
  currentClass: string,
  bowType: string,
  xinfa: string[],
  setType: string,
  statModifier: CalculatorStatModifier | null,
  earlySeasonBonus: boolean
) => {
  const total = Calculator.calculateTotal(
    equips,
    currentClass,
    bowType,
    xinfa,
    setType,
    false,
    statModifier,
    earlySeasonBonus
  );
  return {
    当前流派: currentClass,
    最小外功攻击: total['最小外功攻击'] || 0,
    最大外功攻击: total['最大外功攻击'] || 0,
    最小鸣金攻击: total['最小鸣金攻击'] || 0,
    最大鸣金攻击: total['最大鸣金攻击'] || 0,
    最小裂石攻击: total['最小裂石攻击'] || 0,
    最大裂石攻击: total['最大裂石攻击'] || 0,
    最小牵丝攻击: total['最小牵丝攻击'] || 0,
    最大牵丝攻击: total['最大牵丝攻击'] || 0,
    最小破竹攻击: total['最小破竹攻击'] || 0,
    最大破竹攻击: total['最大破竹攻击'] || 0,
    最小无相攻击: total['最小无相攻击'] || 0,
    最大无相攻击: total['最大无相攻击'] || 0,
    精准率: total['精准率'] || 0,
    会心率: total['会心率'] || 0,
    会意率: total['会意率'] || 0,
    实际精准率: total['实际精准率'] || 0,
    实际会心率: total['实际会心率'] || 0,
    实际会意率: total['实际会意率'] || 0,
    直接会心率: total['直接会心率'] || 0,
    直接会意率: total['直接会意率'] || 0,
    会心伤害加成: total['会心伤害加成'] || 0,
    会意伤害加成: total['会意伤害加成'] || 0,
    外功伤害加成: total['外功伤害加成'] || 0,
    属攻伤害加成: total['属攻伤害加成'] || 0,
    外功穿透: total['外功穿透'] || 0,
    属攻穿透: total['属攻穿透'] || 0,
    无相穿透: total['无相穿透'] || 0,
    鸣金穿透: total['鸣金穿透'] || 0,
    裂石穿透: total['裂石穿透'] || 0,
    牵丝穿透: total['牵丝穿透'] || 0,
    破竹穿透: total['破竹穿透'] || 0,
    全武学增效: total['全武学增效'] || 0,
    指定武学增效: total['指定武学增效'] || 0,
    对首领单位增伤: total['对首领单位增伤'] || 0,
    指定武学技能增伤: total['指定武学技能增伤'] || 0,
    单体类奇术增伤: total['单体类奇术增伤'] || 0,
    群体类奇术增伤: total['群体类奇术增伤'] || 0,
    剑武学增效: total['剑武学增效'] || 0,
    枪武学增效: total['枪武学增效'] || 0,
    伞武学增效: total['伞武学增效'] || 0,
    扇武学增效: total['扇武学增效'] || 0,
    绳标武学增效: total['绳标武学增效'] || 0,
    双刀武学增效: total['双刀武学增效'] || 0,
    陌刀武学增效: total['陌刀武学增效'] || 0,
    横刀武学增效: total['横刀武学增效'] || 0,
    拳甲武学增效: total['拳甲武学增效'] || 0,
    鸣金伤害加成: total['鸣金伤害加成'] || 0,
    裂石伤害加成: total['裂石伤害加成'] || 0,
    牵丝伤害加成: total['牵丝伤害加成'] || 0,
    破竹伤害加成: total['破竹伤害加成'] || 0,
    心法: xinfa,
    套装: setType,
  };
};

const mockChengyin = (equip: EquipItem) => {
  if (equip.mainStat && equip.mainStat.type !== '生存类词条' && equip.mainStat.type !== '生存向') {
    const mMax = CommonData.MAX_VALUES[equip.mainStat.type];
    if (mMax) equip.mainStat.value = parseFloat((mMax * 0.94).toFixed(1));
  }
  equip.subStats.forEach((sub) => {
    if (sub.type !== '生存类词条' && sub.type !== '生存向') {
      const sMax = CommonData.MAX_VALUES[sub.type];
      if (sMax) sub.value = parseFloat((sMax * 0.94).toFixed(1));
    }
  });
  equip.isChengyin = true;
};

const isChengyinEquip = (equip: EquipItem) => {
  if (equip.isChengyin) return true;
  const tolerance = 0.1;
  const targetRatio = 0.94;
  const mainMax = CommonData.MAX_VALUES[equip.mainStat.type];
  if (mainMax) {
    const mainRatio = parseFloat((mainMax * targetRatio).toFixed(1));
    if (Math.abs(equip.mainStat.value - mainRatio) > tolerance) return false;
  }
  for (const sub of equip.subStats) {
    const subMax = CommonData.MAX_VALUES[sub.type];
    if (subMax) {
      const subRatio = parseFloat((subMax * targetRatio).toFixed(1));
      if (Math.abs(sub.value - subRatio) > tolerance) return false;
    }
  }
  return true;
};

const getEquipAveragePercent = (equip: EquipItem) => {
  let totalPct = 0;
  let count = 0;
  const mainMax = CommonData.MAX_VALUES[equip.mainStat.type];
  if (mainMax) {
    totalPct += equip.mainStat.value / mainMax;
    count++;
  }
  equip.subStats.forEach((sub) => {
    const subMax = CommonData.MAX_VALUES[sub.type];
    if (subMax) {
      totalPct += sub.value / subMax;
      count++;
    }
  });
  return count > 0 ? totalPct / count : 0;
};

const createChengyinVersion = (equip: EquipItem) => {
  const chengyinEquip = JSON.parse(JSON.stringify(equip)) as EquipItem;
  chengyinEquip.id = `${equip.id}_chengyin`;
  chengyinEquip.isChengyin = true;
  const mainMax = CommonData.MAX_VALUES[equip.mainStat.type];
  if (mainMax) chengyinEquip.mainStat.value = parseFloat((mainMax * 0.94).toFixed(1));
  chengyinEquip.subStats.forEach((sub) => {
    const subMax = CommonData.MAX_VALUES[sub.type];
    if (subMax) sub.value = parseFloat((subMax * 0.94).toFixed(1));
  });
  return chengyinEquip;
};

const addFullDingyinToEquips = (equippedItems: EquippedItems) => {
  const equipsWithDingyin: EquippedItems = {
    weapon1: null,
    weapon2: null,
    head: null,
    chest: null,
    ring: null,
    pendant: null,
    legs: null,
    hands: null,
  };
  for (const [slotKey, equip] of Object.entries(equippedItems) as Array<
    [keyof EquippedItems, EquipItem | null]
  >) {
    if (!equip) {
      equipsWithDingyin[slotKey] = null;
      continue;
    }
    const equipCopy = JSON.parse(JSON.stringify(equip)) as EquipItem;
    const slotId = equipCopy.slotId;
    if (slotId === '1' || slotId === '3' || slotId === '4') {
      equipCopy.dingyinStat = {
        type: '外功穿透',
        value: CommonData.MAX_VALUES['外功穿透'],
        isPercent: true,
      };
    } else if (['5', '6', '7', '8'].includes(slotId)) {
      equipCopy.dingyinStat = {
        type: '指定武学技能增伤',
        value: CommonData.MAX_VALUES['指定武学技能增伤'],
        isPercent: true,
      };
    }
    equipsWithDingyin[slotKey] = equipCopy;
  }
  return equipsWithDingyin;
};

const calculateBuildRate = (
  equippedItems: EquippedItems,
  currentClass: string,
  bowType: string,
  setType: string,
  xinfa: string[],
  earlySeasonBonus: boolean
) => {
  const equipsWithDingyin = addFullDingyinToEquips(equippedItems);
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
  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  if (!rotationConfig) return { rate: 0, damage: 0 };
  const skillDb = rotationConfig.skillDatabase || {};
  const rotation = rotationConfig.rotation || [];
  const baseline = rotationConfig.baseline || 4244078.34;
  if (!rotation.length) return { rate: 0, damage: 0 };
  const params = { ...totals, 套装: setType, 心法: xinfa, 当前流派: currentClass };
  const result = Calculator.calculateGraduationRate(params, skillDb, rotation, baseline, false);
  return {
    rate: parseFloat(result.graduationRate),
    damage: result.totalDamage,
  };
};

const getTransmutationVariants = (equip: EquipItem, currentClass: string) => {
  if (!equip.isConvertible) return [];
  const armories = CommonData.TRANSMUTATION_POOLS;
  let armoryPool: string[] | null = null;
  if (currentClass === '破竹尘' || currentClass === '破竹鸢') armoryPool = armories['破竹武库'];
  else if (currentClass.includes('鸣金')) armoryPool = armories['鸣金武库'];
  else if (currentClass.includes('裂石')) armoryPool = armories['裂石武库'];
  else if (currentClass.includes('牵丝')) armoryPool = armories['牵丝武库'];
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

const findBestTransmutation = (
  baseEquipped: EquippedItems,
  convertibleEquips: Array<{ slotKey: keyof EquippedItems; equip: EquipItem }>,
  currentClass: string,
  bowType: string,
  setType: string,
  xinfa: string[],
  earlySeasonBonus: boolean,
  minIntentRate?: number | null
) => {
  if (!convertibleEquips.length)
    return { equippedItems: null, rate: 0, damage: 0, transmutations: [] as any[] };
  let bestResult = {
    equippedItems: null as EquippedItems | null,
    rate: 0,
    damage: 0,
    transmutations: [] as any[],
  };

  const traverse = (currentEquipped: EquippedItems, equipIndex: number, transmutations: any[]) => {
    if (equipIndex >= convertibleEquips.length) {
      if (minIntentRate !== null && minIntentRate !== undefined) {
        const equipsWithDingyin = addFullDingyinToEquips(currentEquipped);
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
        earlySeasonBonus
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
        { equipName: equip.name, slotName: slotNameMap[slotKey], fromStat, toStat },
      ];
      traverse(newEquipped, equipIndex + 1, nextTrans);
    });
  };

  traverse(baseEquipped, 0, []);
  return bestResult;
};

const getAllPossibleStats = (equippedItems: EquippedItems) => {
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

const findBestStatsForSlotAsync = async (
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
) => {
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
  } as EquipItem;

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

  let bestMainStat: any = null;
  let bestSubStats: any[] = [];
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

export const GraduationModal = ({
  open,
  onOpenChange,
  db,
  equippedItems,
  currentClass,
  bowType,
  setType,
  xinfaLoadout,
  earlySeasonBonus,
  onApplyBuild,
}: GraduationModalProps) => {
  const [selectedSlotKey, setSelectedSlotKey] = useState<keyof EquippedItems>('weapon1');
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [customTarget, setCustomTarget] = useState<EquipItem | null>(null);
  const [assumeChengyin, setAssumeChengyin] = useState(false);
  const [freezeDingyin, setFreezeDingyin] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotId, setPickerSlotId] = useState('1');
  const [pickerWeaponType, setPickerWeaponType] = useState<string | null>(null);
  const [bestBuildStatus, setBestBuildStatus] = useState<{
    running: boolean;
    text: string;
    percent: number;
    result: any | null;
  }>({ running: false, text: '', percent: 0, result: null });
  const [statPriority, setStatPriority] = useState<{
    gains: Array<{ stat: string; diff: number }>;
    losses: Array<{ stat: string; diff: number }>;
  } | null>(null);
  const [cultivationStatus, setCultivationStatus] = useState<{
    running: boolean;
    text: string;
    percent: number;
    result: any | null;
  }>({ running: false, text: '', percent: 0, result: null });

  const cultivationSummary = useMemo(() => {
    const statSummary: Record<string, number> = {};
    let totalDingyinValue = 0;
    let totalDingyinMax = 0;
    (Object.keys(slotNameMap) as Array<keyof EquippedItems>).forEach((slotKey) => {
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
    return {
      sortedStats,
      totalStatsCount,
      dingyinPercent,
    };
  }, [equippedItems]);

  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  const rotation = rotationConfig?.rotation || [];
  const baseline = rotationConfig?.baseline || 4244078.34;
  const skillDb = rotationConfig?.skillDatabase || {};

  const accTotals = Calculator.calculateTotal(
    equippedItems,
    currentClass,
    bowType,
    xinfaLoadout,
    setType,
    false,
    null,
    earlySeasonBonus
  );
  const accParams = { ...accTotals, 套装: setType, 心法: xinfaLoadout, 当前流派: currentClass };
  const accResult = rotation.length
    ? Calculator.calculateGraduationRate(accParams, skillDb, rotation, baseline, false)
    : { graduationRate: '0.00%', totalDamage: 0 };
  const currentRate = parseFloat(accResult.graduationRate);

  const displayTotals = { ...accTotals };
  for (const key in displayTotals) {
    const val = Number(displayTotals[key]) || 0;
    const isPercent =
      CommonData.PERCENT_STATS.includes(key) ||
      key.includes('率') ||
      key.includes('增效') ||
      key.includes('加成') ||
      key.includes('增伤') ||
      key.includes('穿透');
    displayTotals[key] = isPercent ? parseFloat(val.toFixed(1)) : Math.round(val);
  }
  const excelParams = {
    ...displayTotals,
    套装: setType,
    心法: xinfaLoadout,
    当前流派: currentClass,
  };
  const excelResult = rotation.length
    ? Calculator.calculateGraduationRate(excelParams, skillDb, rotation, baseline, false)
    : { graduationRate: '0.00%', totalDamage: 0 };

  const compareCandidates = useMemo(() => {
    const slotId =
      selectedSlotKey === 'weapon1' || selectedSlotKey === 'weapon2'
        ? '1'
        : selectedSlotKey === 'ring'
          ? '3'
          : selectedSlotKey === 'pendant'
            ? '4'
            : selectedSlotKey === 'head'
              ? '5'
              : selectedSlotKey === 'chest'
                ? '6'
                : selectedSlotKey === 'legs'
                  ? '7'
                  : '8';
    let candidates = db.filter((equip) => equip.slotId === slotId);
    const currentItem = equippedItems[selectedSlotKey];
    if (slotId === '1') {
      if (currentItem) {
        candidates = candidates.filter((equip) => equip.weaponTypeId === currentItem.weaponTypeId);
      } else {
        const allowed = ClassConfig.WEAPON_RULES[currentClass] || [];
        candidates = candidates.filter((equip) => allowed.includes(equip.weaponTypeId || ''));
      }
    }
    if (currentItem) candidates = candidates.filter((equip) => equip.id !== currentItem.id);
    return { candidates, slotId, currentItem };
  }, [db, selectedSlotKey, equippedItems, currentClass]);

  const convertTarget = customTarget || equippedItems[selectedSlotKey];

  const handlePickEquip = (slotKey: keyof EquippedItems, target: EquipItem | null) => {
    const slotId =
      slotKey === 'weapon1' || slotKey === 'weapon2'
        ? '1'
        : slotKey === 'ring'
          ? '3'
          : slotKey === 'pendant'
            ? '4'
            : slotKey === 'head'
              ? '5'
              : slotKey === 'chest'
                ? '6'
                : slotKey === 'legs'
                  ? '7'
                  : '8';
    setPickerSlotId(slotId);
    setPickerWeaponType(target?.weaponTypeId || null);
    setPickerOpen(true);
  };

  const startBestBuild = async () => {
    if (!currentClass) return;
    let minIntentRate: number | null = null;
    if (setType === '飞隼') {
      const input = window.prompt('当前套装为飞隼，请输入最低会意率（0-100）', '20');
      if (input === null) return;
      const parsed = parseFloat(input);
      if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert('请输入0-100之间的有效数值');
        return;
      }
      minIntentRate = parsed;
    }

    setBestBuildStatus({ running: true, text: '正在准备装备数据...', percent: 0, result: null });
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
        earlySeasonBonus
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
            bestBuildB = transResult as typeof bestBuildB;
          }
        }
      }
    };

    await new Promise<void>((resolve) => {
      const processBatch = () => {
        if (workQueue.length === 0 && generatorExhausted) {
          setBestBuildStatus({
            running: false,
            text: '计算完成！',
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
        setBestBuildStatus({
          running: true,
          text: `已检查 ${checkedCount} / ${totalCombinations} 种组合`,
          percent,
          result: null,
        });
        setTimeout(processBatch, 0);
      };
      fillQueue();
      processBatch();
    });
  };

  const startStatPriority = () => {
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
    setStatPriority({ gains: gainResults, losses: lossResults });
  };

  const startCultivation = async () => {
    const slots = (Object.keys(slotNameMap) as Array<keyof EquippedItems>).filter(
      (slotKey) => equippedItems[slotKey]
    );
    if (!slots.length) return;
    setCultivationStatus({ running: true, text: '开始分析...', percent: 0, result: null });
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
          setCultivationStatus({
            running: true,
            text: `分析 ${slotNameMap[slotKey]}：${text}`,
            percent: Math.min(100, ((idx + 1) / slots.length) * 100),
            result: null,
          });
        }
      );

      const maxContribution = bestRate - blankRate;
      const improvementSpace = maxContribution - originalContribution;
      equipImprovements.push({
        slotKey,
        slotName: slotNameMap[slotKey],
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
      if (weapon1 && weapon2)
        secondBestWeapon = weapon1.improvementSpace > weapon2.improvementSpace ? weapon1 : weapon2;
      else if (weapon1) secondBestWeapon = weapon1;
      else if (weapon2) secondBestWeapon = weapon2;
    }

    setCultivationStatus({
      running: false,
      text: '分析完成',
      percent: 100,
      result: { bestImprovementEquip, secondBestWeapon },
    });
  };

  const renderCompare = () => {
    if (compareCandidates.candidates.length === 0) {
      return (
        <div className="text-muted-foreground py-10 text-center">
          库中没有符合条件的同类装备可供对比
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {compareCandidates.candidates.map((equip) => {
          const testEquip = JSON.parse(JSON.stringify(equip)) as EquipItem;
          if (assumeChengyin) mockChengyin(testEquip);
          if (freezeDingyin)
            testEquip.dingyinStat = compareCandidates.currentItem?.dingyinStat || null;
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
          const diffColor =
            diff > 0.0001
              ? 'text-red-400'
              : diff < -0.0001
                ? 'text-green-400'
                : 'text-muted-foreground';
          const diffSign = diff > 0.0001 ? '+' : '';
          return (
            <div
              key={equip.id}
              className="border-border/60 bg-card space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={`/${equip.icon}`}
                  alt={equip.name}
                  width={48}
                  height={48}
                  className="rounded-md border"
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {equip.name}
                    {assumeChengyin ? ' (拟)' : ''}
                  </div>
                  <div className="text-muted-foreground text-xs">毕业率: {newRate.toFixed(2)}%</div>
                </div>
                <div className={`text-sm font-semibold ${diffColor}`}>
                  {diffSign}
                  {diff.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderConvertTab = () => {
    if (!convertTarget) {
      return (
        <div className="text-muted-foreground py-10 text-center">
          当前部位未穿戴装备，请先穿戴或点击按钮选择装备
          <div className="mt-4">
            <Button onClick={() => handlePickEquip(selectedSlotKey, null)}>
              选择/录入装备进行分析
            </Button>
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handlePickEquip(selectedSlotKey, convertTarget)}
          >
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
              onClick={() => setSelectedSubIndex(idx)}
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
                  className={`text-sm ${armory.expected > 0 ? 'text-red-400' : armory.expected < 0 ? 'text-green-400' : 'text-muted-foreground'}`}
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

  const renderEquipList = (equips: EquippedItems) => {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {(Object.keys(slotNameMap) as Array<keyof EquippedItems>).map((slotKey) => {
          const equip = equips[slotKey];
          return (
            <div key={slotKey} className="border-border/60 bg-card rounded-md border p-2 text-xs">
              <div className="font-medium">{slotNameMap[slotKey]}</div>
              <div className="text-muted-foreground">{equip ? equip.name : '（空）'}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>毕业率分析</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[260px_1fr] gap-4">
          <div className="space-y-3">
            <div className="border-border/60 bg-card rounded-lg border p-3 text-center">
              <div className="text-muted-foreground text-xs">当前毕业率</div>
              <div className="text-xl font-semibold text-yellow-300">
                {accResult.graduationRate}
              </div>
              <div className="text-muted-foreground text-xs">
                excel表格显示：{excelResult.graduationRate}
              </div>
            </div>
            <div className="space-y-2">
              {(Object.keys(slotKeyMap) as Array<keyof EquippedItems>).map((key) => {
                const item = equippedItems[key];
                return (
                  <button
                    key={key}
                    className={`flex w-full items-center gap-2 rounded-lg border p-2 text-left ${
                      selectedSlotKey === key ? 'border-primary' : 'border-border/60'
                    }`}
                    onClick={() => {
                      setSelectedSlotKey(key);
                      setSelectedSubIndex(0);
                      setCustomTarget(null);
                    }}
                  >
                    <Image
                      src={`/${item?.icon || 'icon/icon1.jpg'}`}
                      alt={item?.name || '未穿戴'}
                      width={40}
                      height={40}
                      className="rounded-md border"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item?.name || '未穿戴'}</div>
                      <div className="text-muted-foreground text-xs">{slotNameMap[key]}</div>
                    </div>
                    {item ? (
                      <span className="text-muted-foreground text-xs">{getScore(item)}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="min-w-0">
            <Tabs defaultValue="compare" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="compare">单件装备对比</TabsTrigger>
                <TabsTrigger value="convert">转律建议</TabsTrigger>
                <TabsTrigger value="best-build">最佳配装</TabsTrigger>
                <TabsTrigger value="stat-priority">词条优先级</TabsTrigger>
                <TabsTrigger value="cultivation">培养方向</TabsTrigger>
              </TabsList>
              <TabsContent value="compare" className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={assumeChengyin}
                      onCheckedChange={(v) => setAssumeChengyin(Boolean(v))}
                    />
                    假设满承音
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={freezeDingyin}
                      onCheckedChange={(v) => setFreezeDingyin(Boolean(v))}
                    />
                    冻结当前定音
                  </label>
                </div>
                {renderCompare()}
              </TabsContent>
              <TabsContent value="convert" className="pt-4">
                {renderConvertTab()}
              </TabsContent>
              <TabsContent value="best-build" className="text-muted-foreground pt-4">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    最佳配装将遍历数据库中所有可能的组合（贷款满定音），找出毕业率最高的方案。
                  </p>
                  <Button onClick={startBestBuild} disabled={bestBuildStatus.running}>
                    {bestBuildStatus.running ? '计算中...' : '开始寻找最佳配装'}
                  </Button>
                  {bestBuildStatus.running && (
                    <div className="text-muted-foreground text-sm">
                      {bestBuildStatus.text} ({bestBuildStatus.percent.toFixed(1)}%)
                    </div>
                  )}
                  {bestBuildStatus.result && (
                    <div className="space-y-4">
                      <div className="border-border/60 bg-card rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">最佳配装方案</div>
                          <Button
                            size="sm"
                            onClick={() =>
                              onApplyBuild(bestBuildStatus.result.buildA.equippedItems)
                            }
                          >
                            使用该方案
                          </Button>
                        </div>
                        <div className="text-muted-foreground mt-2 text-sm">
                          毕业率 {bestBuildStatus.result.buildA.rate.toFixed(2)}%
                        </div>
                        <div className="mt-3">
                          {renderEquipList(bestBuildStatus.result.buildA.equippedItems)}
                        </div>
                      </div>
                      {bestBuildStatus.result.buildB && (
                        <div className="border-border/60 bg-card rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">转律后最佳配装方案</div>
                            <Button
                              size="sm"
                              onClick={() =>
                                onApplyBuild(bestBuildStatus.result.buildB.equippedItems)
                              }
                            >
                              使用该方案
                            </Button>
                          </div>
                          <div className="text-muted-foreground mt-2 text-sm">
                            毕业率 {bestBuildStatus.result.buildB.rate.toFixed(2)}%
                          </div>
                          <div className="mt-3">
                            {renderEquipList(bestBuildStatus.result.buildB.equippedItems)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="stat-priority" className="text-muted-foreground pt-4">
                <div className="space-y-4">
                  <Button onClick={startStatPriority}>计算词条优先级</Button>
                  {statPriority ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-sm font-medium">新增词条收益</div>
                        {statPriority.gains.slice(0, 30).map((item) => (
                          <div key={item.stat} className="flex justify-between text-sm">
                            <span>{item.stat}</span>
                            <span className={item.diff > 0 ? 'text-red-400' : 'text-green-400'}>
                              {item.diff > 0 ? '+' : ''}
                              {item.diff.toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">扣除词条损失</div>
                        {statPriority.losses.slice(0, 30).map((item) => (
                          <div key={item.stat} className="flex justify-between text-sm">
                            <span>{item.stat}</span>
                            <span className={item.diff > 0 ? 'text-green-400' : 'text-red-400'}>
                              {item.diff > 0 ? '-' : '+'}
                              {Math.abs(item.diff).toFixed(2)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">尚未计算。</div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="cultivation" className="text-muted-foreground pt-4">
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
                  <Button onClick={startCultivation} disabled={cultivationStatus.running}>
                    {cultivationStatus.running ? '分析中...' : '计算培养建议'}
                  </Button>
                  {cultivationStatus.running && (
                    <div className="text-muted-foreground text-sm">
                      {cultivationStatus.text} ({cultivationStatus.percent.toFixed(1)}%)
                    </div>
                  )}
                  {cultivationStatus.result && (
                    <div className="space-y-4">
                      {cultivationStatus.result.bestImprovementEquip && (
                        <div className="border-border/60 bg-card rounded-lg border p-3">
                          <div className="font-medium">提升空间最大部位</div>
                          <div className="text-muted-foreground text-sm">
                            {cultivationStatus.result.bestImprovementEquip.slotName} -{' '}
                            {cultivationStatus.result.bestImprovementEquip.improvementSpace.toFixed(
                              2
                            )}
                            %
                          </div>
                          {cultivationStatus.result.bestImprovementEquip.bestMainStat && (
                            <div className="text-muted-foreground mt-2 text-xs">
                              推荐主词条：
                              {cultivationStatus.result.bestImprovementEquip.bestMainStat.stat}
                            </div>
                          )}
                          {cultivationStatus.result.bestImprovementEquip.bestSubStats?.length >
                            0 && (
                            <div className="text-muted-foreground mt-1 text-xs">
                              推荐副词条：
                              {cultivationStatus.result.bestImprovementEquip.bestSubStats
                                .map((stat: any) => stat.stat)
                                .join('、')}
                            </div>
                          )}
                        </div>
                      )}
                      {cultivationStatus.result.secondBestWeapon && (
                        <div className="border-border/60 bg-card rounded-lg border p-3">
                          <div className="font-medium">武器提升空间更大者</div>
                          <div className="text-muted-foreground text-sm">
                            {cultivationStatus.result.secondBestWeapon.slotName} -{' '}
                            {cultivationStatus.result.secondBestWeapon.improvementSpace.toFixed(2)}%
                          </div>
                          {cultivationStatus.result.secondBestWeapon.bestMainStat && (
                            <div className="text-muted-foreground mt-2 text-xs">
                              推荐主词条：
                              {cultivationStatus.result.secondBestWeapon.bestMainStat.stat}
                            </div>
                          )}
                          {cultivationStatus.result.secondBestWeapon.bestSubStats?.length > 0 && (
                            <div className="text-muted-foreground mt-1 text-xs">
                              推荐副词条：
                              {cultivationStatus.result.secondBestWeapon.bestSubStats
                                .map((stat: any) => stat.stat)
                                .join('、')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <EquipPickerModal
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          slotId={pickerSlotId}
          weaponTypeId={pickerWeaponType}
          db={db}
          onSelect={(item) => {
            setCustomTarget(item);
            setSelectedSubIndex(0);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
