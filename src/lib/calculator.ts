import { Equipment, Affix, AffixType, SimulationSlot } from '@/types';
import { AFFIX_MAX_VALUES, AFFIX_WEIGHTS, SLOT_MAPPING } from './constants';
import { coreCalculator } from './coreCalculator';
import { convertEquipmentsToCalculatorFormat } from './calculatorAdapter';

/**
 * 计算单个词条的毕业率
 */
export function calculateAffixGraduation(affix: Affix): number {
  if (!affix.type || affix.value <= 0) return 0;

  const maxValue = AFFIX_MAX_VALUES[affix.type as AffixType];
  if (!maxValue) return 0;

  const ratio = Math.min(affix.value / maxValue, 1);
  return ratio * 100;
}

/**
 * 计算单件装备的毕业率
 */
export function calculateEquipmentGraduation(equipment: Equipment): number {
  const affixes: Affix[] = [
    equipment.mainAffix,
    ...equipment.subAffixes,
    equipment.dingyin,
  ].filter(a => a.type && a.value > 0);

  if (affixes.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  affixes.forEach((affix) => {
    if (!affix.type) return;

    const graduation = calculateAffixGraduation(affix);
    const weight = AFFIX_WEIGHTS[affix.type as AffixType] || 1;

    totalWeightedScore += graduation * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return 0;

  // 基础毕业率
  let baseRate = totalWeightedScore / totalWeight;

  // 承音加成
  if (equipment.isChengyin) {
    baseRate *= 1.05;
  }

  // 紫装惩罚（紫装毕业率稍低）
  if (equipment.isPurple) {
    baseRate *= 0.9;
  }

  return Math.min(baseRate, 100);
}

/**
 * 计算整套装备的毕业率
 */
export function calculateTotalGraduation(
  equipments: Equipment[],
  equippedIds: Record<string, string | undefined>,
  assumeFullChengyin: boolean = false
): number {
  const equippedEquipments: Equipment[] = [];

  Object.entries(equippedIds).forEach(([slot, equipmentId]) => {
    if (equipmentId) {
      const equipment = equipments.find(e => e.id === equipmentId);
      if (equipment) {
        equippedEquipments.push(equipment);
      }
    }
  });

  if (equippedEquipments.length === 0) return 0;

  let totalGraduation = 0;
  equippedEquipments.forEach((equipment) => {
    let grad = calculateEquipmentGraduation(equipment);

    // 如果假设满承音，给非承音装备加承音加成
    if (assumeFullChengyin && !equipment.isChengyin) {
      grad *= 1.05;
    }

    totalGraduation += grad;
  });

  // 装备数量加权
  const slotCount = 8; // 总共8个槽位
  const filledRatio = equippedEquipments.length / slotCount;

  // 平均毕业率
  return (totalGraduation / equippedEquipments.length) * filledRatio * (1 + filledRatio * 0.1);
}

/**
 * 计算期望秒伤（使用核心计算器）
 */
export function calculateExpectedDPS(
  equipments: Equipment[],
  equippedIds: Record<string, string | undefined>,
  xinfa: string,
  gongJue: string,
  neiGong: string
): number {
  // 使用核心计算器计算面板属性
  const calculatorEquipments = convertEquipmentsToCalculatorFormat(equipments, equippedIds);
  
  // 将弓诀转换为计算器格式
  const bowTypeMap: Record<string, string> = {
    '精准弓': 'precision',
    '会心弓': 'crit',
    '会意弓': 'intent',
  };
  const bowType = bowTypeMap[gongJue] || 'precision';

  // 心法列表（可能需要从配置中获取多个心法）
  const xinfaList = [xinfa]; // 简化处理，实际可能需要多个心法

  // 计算总面板属性
  const totalStats = coreCalculator.calculateTotal(
    calculatorEquipments,
    xinfa,
    bowType,
    xinfaList,
    neiGong,
    false, // debug
    null, // statModifier
    false // earlySeasonBonus
  );

  // 基于面板属性计算简化的DPS
  // 注意：完整的毕业率计算需要使用 calculateGraduationRate，这里提供简化版本
  const minAtk = totalStats['最小外功攻击'] || 0;
  const maxAtk = totalStats['最大外功攻击'] || 0;
  const avgAtk = (minAtk + maxAtk) / 2;
  const critRate = totalStats['实际会心率'] || 0;
  const critDmg = (totalStats['会心伤害加成'] || 0) / 100;
  const pen = (totalStats['外功穿透'] || 0) / 200;

  // 简化的DPS计算
  const baseDPS = avgAtk * (1 + pen) * (1 + critRate / 100 * critDmg);
  
  return Math.round(baseDPS);
}

/**
 * 分析词条优先级
 */
export function analyzeAffixPriority(
  equipments: Equipment[],
  equippedIds: Record<string, string | undefined>
): { affix: AffixType; benefit: number }[] {
  const priorities: { affix: AffixType; benefit: number }[] = [];

  // 统计已有词条
  const currentAffixes: Record<string, number> = {};
  Object.values(equippedIds).forEach((equipmentId) => {
    if (equipmentId) {
      const equipment = equipments.find(e => e.id === equipmentId);
      if (equipment) {
        [equipment.mainAffix, ...equipment.subAffixes, equipment.dingyin].forEach((affix) => {
          if (affix.type && affix.value > 0) {
            currentAffixes[affix.type] = (currentAffixes[affix.type] || 0) + affix.value;
          }
        });
      }
    }
  });

  // 计算每种词条的边际收益
  Object.entries(AFFIX_WEIGHTS).forEach(([affixType, weight]) => {
    const current = currentAffixes[affixType] || 0;
    const maxValue = AFFIX_MAX_VALUES[affixType as AffixType];

    // 边际收益递减
    const fillRate = current / (maxValue * 8); // 假设8件装备
    const marginalBenefit = weight * (1 - fillRate * 0.5);

    priorities.push({
      affix: affixType as AffixType,
      benefit: marginalBenefit,
    });
  });

  // 按收益排序
  return priorities.sort((a, b) => b.benefit - a.benefit);
}

/**
 * 获取培养建议
 */
export function getCultivationAdvice(
  equipments: Equipment[],
  equippedIds: Record<string, string | undefined>
): string[] {
  const advice: string[] = [];

  const priorities = analyzeAffixPriority(equipments, equippedIds);
  const topAffixes = priorities.slice(0, 3);

  advice.push(`当前最需要的词条: ${topAffixes.map(p => p.affix).join('、')}`);

  // 检查槽位填充情况
  let filledCount = 0;
  Object.values(equippedIds).forEach((id) => {
    if (id) filledCount++;
  });

  if (filledCount < 8) {
    advice.push(`还有 ${8 - filledCount} 个槽位未装备，优先填满槽位`);
  }

  // 检查承音情况
  let chengyinCount = 0;
  Object.values(equippedIds).forEach((equipmentId) => {
    if (equipmentId) {
      const equipment = equipments.find(e => e.id === equipmentId);
      if (equipment?.isChengyin) chengyinCount++;
    }
  });

  if (chengyinCount < filledCount) {
    advice.push(`${filledCount - chengyinCount} 件装备未承音，建议优先承音`);
  }

  return advice;
}

/**
 * 使用核心计算器计算毕业率（完整版）
 * 需要提供技能数据库和技能循环
 */
export function calculateGraduationRateWithCore(
  equipments: Equipment[],
  equippedIds: Record<string, string | undefined>,
  xinfa: string,
  gongJue: string,
  neiGong: string,
  skillDb: Record<string, any>,
  rotation: any[],
  baseline: number = 4244078.34,
  useNextSeason: boolean = false
): { totalDamage: number; graduationRate: string; debugInfo: any } {
  // 转换装备格式
  const calculatorEquipments = convertEquipmentsToCalculatorFormat(equipments, equippedIds);
  
  // 将弓诀转换为计算器格式
  const bowTypeMap: Record<string, string> = {
    '精准弓': 'precision',
    '会心弓': 'crit',
    '会意弓': 'intent',
  };
  const bowType = bowTypeMap[gongJue] || 'precision';

  // 心法列表
  const xinfaList = [xinfa];

  // 计算总面板属性
  const totalStats = coreCalculator.calculateTotal(
    calculatorEquipments,
    xinfa,
    bowType,
    xinfaList,
    neiGong,
    false,
    null,
    useNextSeason
  );

  // 准备参数
  const params: Record<string, number | string | string[]> = {
    ...totalStats,
    '当前流派': xinfa,
    '心法': xinfaList,
    '套装': neiGong,
  };

  // 计算毕业率
  return coreCalculator.calculateGraduationRate(
    params,
    skillDb,
    rotation,
    baseline,
    false
  );
}
