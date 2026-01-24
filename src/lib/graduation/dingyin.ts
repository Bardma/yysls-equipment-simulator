import { CommonData } from '@/lib/data/commonData';
import type { EquipItem, EquippedItems } from '@/lib/types';

/**
 * 为所有装备添加满定音词条
 */
export const addFullDingyinToEquips = (equippedItems: EquippedItems): EquippedItems => {
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
