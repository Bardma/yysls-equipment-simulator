import { CommonData } from '@/lib/data/commonData';
import type { EquipItem } from '@/lib/types';

/**
 * MoNiChengYinXiaoGuo（JiangAffixSheWeiZuiDaZhiDe94%）
 */
export const mockChengyin = (equip: EquipItem): void => {
  if (
    equip.mainStat &&
    equip.mainStat.type !== 'ShengCunLeiAffix' &&
    equip.mainStat.type !== 'ShengCunXiang'
  ) {
    const mMax = CommonData.MAX_VALUES[equip.mainStat.type];
    if (mMax) equip.mainStat.value = parseFloat((mMax * 0.94).toFixed(1));
  }

  equip.subStats.forEach((sub) => {
    if (sub.type !== 'ShengCunLeiAffix' && sub.type !== 'ShengCunXiang') {
      const sMax = CommonData.MAX_VALUES[sub.type];
      if (sMax) sub.value = parseFloat((sMax * 0.94).toFixed(1));
    }
  });

  equip.isChengyin = true;
};

/**
 * PanDuanEquipmentShiFouWeiChengYinEquipment
 */
export const isChengyinEquip = (equip: EquipItem): boolean => {
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

/**
 * ChuangJianEquipmentDeChengYinBanBen
 */
export const createChengyinVersion = (equip: EquipItem): EquipItem => {
  const chengyinEquip = JSON.parse(JSON.stringify(equip)) as EquipItem;
  chengyinEquip.id = `${equip.id}_chengyin`;
  chengyinEquip.isChengyin = true;

  const mainMax = CommonData.MAX_VALUES[equip.mainStat.type];
  if (mainMax) {
    chengyinEquip.mainStat.value = parseFloat((mainMax * 0.94).toFixed(1));
  }

  chengyinEquip.subStats.forEach((sub) => {
    const subMax = CommonData.MAX_VALUES[sub.type];
    if (subMax) sub.value = parseFloat((subMax * 0.94).toFixed(1));
  });

  return chengyinEquip;
};
