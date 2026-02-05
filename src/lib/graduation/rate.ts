import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import { CommonData } from '@/lib/data/commonData';
import type { CalculatorStatModifier, EquippedItems } from '@/lib/types';

/**
 * JiSuanGraduation Rate
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
      key.includes('L') ||
      key.includes(' Effectiveness') ||
      key.includes('JiaCheng') ||
      key.includes(' Damage Bonus');
    const isPenetration = key.includes(' Penetration');
    totals[key] = isPercent || isPenetration ? parseFloat(val.toFixed(1)) : Math.round(val);
  }

  const calcParams = { ...totals, Set: setType, Inner Way: xinfa, DangQianLiuPai: currentClass };
  const rotationConfig = ClassConfig.ROTATIONS[currentClass];
  const skillDb = rotationConfig?.skillDatabase || {};
  const rotation = rotationConfig?.rotation || [];
  const baseline = rotationConfig?.baseline || 4244078.34;

  if (!rotation.length) return { graduationRate: '0.00%', totalDamage: 0 };

  return Calculator.calculateGraduationRate(calcParams, skillDb, rotation, baseline, false);
};

/**
 * DaiShuXingXiuGaiQiDeGraduation RateJiSuan
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
    DangQianLiuPai: currentClass,
    Min Outer Attack: total['Min Outer Attack'] || 0,
    Max Outer Attack: total['Max Outer Attack'] || 0,
    Min Mingjin Attack: total['Min Mingjin Attack'] || 0,
    Max Mingjin Attack: total['Max Mingjin Attack'] || 0,
    Min Lie Shi Attack: total['Min Lie Shi Attack'] || 0,
    Max Lie Shi Attack: total['Max Lie Shi Attack'] || 0,
    Min Qian Si Attack: total['Min Qian Si Attack'] || 0,
    Max Qian Si Attack: total['Max Qian Si Attack'] || 0,
    Min Po Zhu Attack: total['Min Po Zhu Attack'] || 0,
    Max Po Zhu Attack: total['Max Po Zhu Attack'] || 0,
    ZuiXiaoNoneXiangGongJi: total['ZuiXiaoNoneXiangGongJi'] || 0,
    ZuiDaNoneXiangGongJi: total['ZuiDaNoneXiangGongJi'] || 0,
    Accuracy: total['Accuracy'] || 0,
    Crit Rate: total['Crit Rate'] || 0,
    Insight Rate: total['Insight Rate'] || 0,
    ShiJiJingZhunL: total['ShiJiJingZhunL'] || 0,
    ShiJiHuiXinL: total['ShiJiHuiXinL'] || 0,
    ShiJiHuiYiL: total['ShiJiHuiYiL'] || 0,
    Direct Crit Rate: total['Direct Crit Rate'] || 0,
    Direct Insight Rate: total['Direct Insight Rate'] || 0,
    Crit Damage Bonus: total['Crit Damage Bonus'] || 0,
    Insight Damage Bonus: total['Insight Damage Bonus'] || 0,
    Outer Damage Bonus: total['Outer Damage Bonus'] || 0,
    Elemental Damage Bonus: total['Elemental Damage Bonus'] || 0,
    Outer Penetration: total['Outer Penetration'] || 0,
    Elemental Penetration: total['Elemental Penetration'] || 0,
    NoneXiang Penetration: total['NoneXiang Penetration'] || 0,
    Ming Jin Penetration: total['Ming Jin Penetration'] || 0,
    Lie Shi Penetration: total['Lie Shi Penetration'] || 0,
    Qian Si Penetration: total['Qian Si Penetration'] || 0,
    Po Zhu Penetration: total['Po Zhu Penetration'] || 0,
    All Martial Arts Effectiveness: total['All Martial Arts Effectiveness'] || 0,
    Specific Martial Art Effectiveness: total['Specific Martial Art Effectiveness'] || 0,
    Boss Damage Bonus: total['Boss Damage Bonus'] || 0,
    Specific Skill Damage Bonus: total['Specific Skill Damage Bonus'] || 0,
    Singletarget Technique Damage Bonus: total['Singletarget Technique Damage Bonus'] || 0,
    AoE Technique Damage Bonus: total['AoE Technique Damage Bonus'] || 0,
    Sword Martial Art Effectiveness: total['Sword Martial Art Effectiveness'] || 0,
    Spear Martial Art Effectiveness: total['Spear Martial Art Effectiveness'] || 0,
    Umbrella Martial Art Effectiveness: total['Umbrella Martial Art Effectiveness'] || 0,
    Fan Martial Art Effectiveness: total['Fan Martial Art Effectiveness'] || 0,
    Rope Dart Martial Art Effectiveness: total['Rope Dart Martial Art Effectiveness'] || 0,
    Dual Blades Martial Art Effectiveness: total['Dual Blades Martial Art Effectiveness'] || 0,
    Great Blade Martial Art Effectiveness: total['Great Blade Martial Art Effectiveness'] || 0,
    Sabre Martial Art Effectiveness: total['Sabre Martial Art Effectiveness'] || 0,
    Fist Martial Art Effectiveness: total['Fist Martial Art Effectiveness'] || 0,
    Mingjin Damage Bonus: total['Mingjin Damage Bonus'] || 0,
    Lieshi Damage Bonus: total['Lieshi Damage Bonus'] || 0,
    Qiansi Damage Bonus: total['Qiansi Damage Bonus'] || 0,
    Pozhu Damage Bonus: total['Pozhu Damage Bonus'] || 0,
    Inner Way: xinfa,
    Set: setType,
  };
};

/**
 * JiSuanPeiZhuangGraduation Rate
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

  const params = { ...totals, Set: setType, Inner Way: xinfa, DangQianLiuPai: currentClass };
  const result = Calculator.calculateGraduationRate(params, skillDb, rotation, baseline, false);

  return {
    rate: parseFloat(result.graduationRate),
    damage: result.totalDamage,
  };
};
