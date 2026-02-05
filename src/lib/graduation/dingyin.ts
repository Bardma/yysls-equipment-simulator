import { CommonData } from '@/lib/data/commonData';
import type { EquipItem, EquippedItems } from '@/lib/types';

/**
 * WeiSuoYouEquipmentTianJiaManDingyin Affix
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
        type: 'Outer Penetration',
        value: CommonData.MAX_VALUES['Outer Penetration'],
        isPercent: true,
      };
    } else if (['5', '6', '7', '8'].includes(slotId)) {
      equipCopy.dingyinStat = {
        type: 'Specific Skill Damage Bonus',
        value: CommonData.MAX_VALUES['Specific Skill Damage Bonus'],
        isPercent: true,
      };
    }

    equipsWithDingyin[slotKey] = equipCopy;
  }

  return equipsWithDingyin;
};
