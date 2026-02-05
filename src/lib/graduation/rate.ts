import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import type { CalculatorStatModifier, EquippedItems } from '@/lib/types';

/**
 * 计算毕业率
 */
export const calcRate = (
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

/**
 * 带属性修改器的毕业率计算
 */
export const calcRateWithStatModifier = (
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

/**
 * 计算配装毕业率
 */
export const calculateBuildRate = (
  equippedItems: EquippedItems,
  currentClass: string,
  bowType: string,
  setType: string,
  xinfa: string[],
  earlySeasonBonus: boolean,
  addFullDingyinToEquips: (equips: EquippedItems) => EquippedItems
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
