import { CommonData } from "./data/commonData";
import type { EquipItem } from "./types";

const KEY = "YYSS2024";

export const encryptData = (data: unknown): string | null => {
  try {
    const jsonStr = JSON.stringify(data);
    let encrypted = "";
    for (let i = 0; i < jsonStr.length; i++) {
      encrypted += String.fromCharCode(jsonStr.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
    }
    const encoded = encodeURIComponent(encrypted);
    return btoa(encoded);
  } catch {
    return null;
  }
};

export const decryptData = (encryptedStr: string): any | null => {
  try {
    const decoded = atob(encryptedStr);
    const decodedStr = decodeURIComponent(decoded);
    let decrypted = "";
    for (let i = 0; i < decodedStr.length; i++) {
      decrypted += String.fromCharCode(decodedStr.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
    }
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
};

export const optimizeEquipData = (equipData: EquipItem[]) => {
  return equipData.map((equip) => {
    const optimized: any = {
      id: equip.id,
      slotId: equip.slotId,
      weaponTypeId: equip.weaponTypeId || null,
      name: equip.name,
      isChengyin: equip.isChengyin || false,
      isPurple: equip.isPurple || false,
      isConvertible: equip.isConvertible || false,
      mainStat: {
        type: equip.mainStat.type,
        value: equip.mainStat.value,
      },
      subStats: equip.subStats.map((sub) => ({
        type: sub.type,
        value: sub.value,
      })),
    };
    if (equip.dingyinStat) {
      optimized.dingyinStat = {
        type: equip.dingyinStat.type,
        value: equip.dingyinStat.value,
      };
    }
    return optimized;
  });
};

export const restoreEquipData = (optimizedEquip: any): EquipItem => {
  const equip = { ...optimizedEquip } as EquipItem;
  const slotInfo = CommonData.SLOTS.find((s) => s.id === equip.slotId);
  equip.slotName = slotInfo ? slotInfo.name : "";
  if (equip.slotId === "1" && equip.weaponTypeId) {
    const weaponInfo = CommonData.WEAPON_TYPES.find((w) => w.id === equip.weaponTypeId);
    equip.icon = weaponInfo ? weaponInfo.icon : "icon/icon1.jpg";
  } else {
    equip.icon = slotInfo ? slotInfo.icon : "icon/icon1.jpg";
  }
  equip.mainStat.isPercent = CommonData.PERCENT_STATS.includes(equip.mainStat.type);
  equip.subStats = equip.subStats.map((sub: any) => ({
    ...sub,
    isPercent: CommonData.PERCENT_STATS.includes(sub.type),
  }));
  if (equip.dingyinStat) {
    equip.dingyinStat.isPercent = CommonData.PERCENT_STATS.includes(equip.dingyinStat.type);
  }
  return equip;
};

export const normalizeLegacyEquipData = (equip: EquipItem): EquipItem => {
  if (equip.mainStat && equip.mainStat.isPercent === undefined) {
    equip.mainStat.isPercent = CommonData.PERCENT_STATS.includes(equip.mainStat.type);
  }
  if (equip.subStats) {
    equip.subStats = equip.subStats.map((sub) => {
      if (sub.isPercent === undefined) {
        sub.isPercent = CommonData.PERCENT_STATS.includes(sub.type);
      }
      return sub;
    });
  }
  if (equip.dingyinStat && equip.dingyinStat.isPercent === undefined) {
    equip.dingyinStat.isPercent = CommonData.PERCENT_STATS.includes(equip.dingyinStat.type);
  }
  return equip;
};
