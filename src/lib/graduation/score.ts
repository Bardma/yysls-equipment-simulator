import { CommonData } from '@/lib/data/commonData';
import type { EquipItem } from '@/lib/types';

/**
 * 计算装备的平均得分百分比
 */
export const getEquipScore = (equip: EquipItem): string => {
  let totalPct = 0;
  let count = 0;

  if (
    equip.mainStat &&
    equip.mainStat.type !== '生存类词条' &&
    equip.mainStat.type !== '生存向'
  ) {
    const maxVal = CommonData.MAX_VALUES[equip.mainStat.type];
    if (maxVal) {
      totalPct += equip.mainStat.value / maxVal;
      count++;
    }
  }

  equip.subStats.forEach((sub) => {
    if (sub.type !== '生存类词条' && sub.type !== '生存向') {
      const maxVal = CommonData.MAX_VALUES[sub.type];
      if (maxVal) {
        totalPct += sub.value / maxVal;
        count++;
      }
    }
  });

  return count > 0 ? `${((totalPct / count) * 100).toFixed(1)}%` : '0.0%';
};

/**
 * 获取装备的平均百分比（数值形式）
 */
export const getEquipAveragePercent = (equip: EquipItem): number => {
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
