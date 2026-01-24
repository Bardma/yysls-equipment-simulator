/**
 * 计算器适配层
 * 将项目中的 Equipment/Affix 数据结构转换为核心计算器需要的格式
 */

import {
  Equipment,
  Affix,
  SimulationSlot,
  SLOT_NAME_TO_ID,
  EquipmentSlot,
} from "@/types";
import { CalculatorEquipment, CalculatorStat } from "./coreCalculator";
import { SLOT_MAPPING } from "./constants";

// 正确的槽位ID映射（与 CommonData.SLOTS 对应）
// 武器=1, 环=3, 佩=4, 冠胄=5, 胸甲=6, 胫甲=7, 腕甲=8
const SIMULATION_SLOT_TO_ID: Record<SimulationSlot, string> = {
  武器1: "1",
  武器2: "1",
  环: "3",
  佩: "4",
  冠胄: "5",
  胸甲: "6",
  胫甲: "7",
  腕甲: "8",
};

// 旧词条类型到新属性名的映射（用于兼容旧数据）
const LEGACY_AFFIX_TYPE_MAP: Record<string, string> = {
  攻击: "最大外功攻击",
  攻击百分比: "最大外功攻击",
  外功攻击: "最大外功攻击",
  内功攻击: "最大外功攻击",
  会心: "会心率",
  会心伤害: "会心伤害加成",
  破防: "外功穿透",
  命中: "精准率",
  // 以下为直接映射（新数据格式）
  最小外功攻击: "最小外功攻击",
  最大外功攻击: "最大外功攻击",
  会心率: "会心率",
  会意率: "会意率",
  精准率: "精准率",
  会心伤害加成: "会心伤害加成",
  会意伤害加成: "会意伤害加成",
  外功穿透: "外功穿透",
  属攻穿透: "属攻穿透",
  全武学增效: "全武学增效",
  指定武学技能增伤: "指定武学技能增伤",
  对首领单位增伤: "对首领单位增伤",
  劲: "劲",
  敏: "敏",
  势: "势",
  // 属攻
  最小鸣金攻击: "最小鸣金攻击",
  最大鸣金攻击: "最大鸣金攻击",
  最小裂石攻击: "最小裂石攻击",
  最大裂石攻击: "最大裂石攻击",
  最小牵丝攻击: "最小牵丝攻击",
  最大牵丝攻击: "最大牵丝攻击",
  最小破竹攻击: "最小破竹攻击",
  最大破竹攻击: "最大破竹攻击",
  最小无相攻击: "最小无相攻击",
  最大无相攻击: "最大无相攻击",
  // 武器增效
  剑武学增效: "剑武学增效",
  枪武学增效: "枪武学增效",
  伞武学增效: "伞武学增效",
  扇武学增效: "扇武学增效",
  绳标武学增效: "绳标武学增效",
  双刀武学增效: "双刀武学增效",
  陌刀武学增效: "陌刀武学增效",
  横刀武学增效: "横刀武学增效",
  拳甲武学增效: "拳甲武学增效",
};

/**
 * 将 Affix 转换为 CalculatorStat
 */
function convertAffixToStat(affix: Affix): CalculatorStat | null {
  if (!affix.type || affix.value <= 0) return null;

  // 映射词条类型（支持旧数据格式）
  const mappedType = LEGACY_AFFIX_TYPE_MAP[affix.type] || affix.type;

  return {
    type: mappedType,
    value: affix.value,
    isPercent: affix.isPercent,
  };
}

/**
 * 将槽位映射到计算器的 slotId
 * 使用正确的映射：武器=1, 环=3, 佩=4, 冠胄=5, 胸甲=6, 胫甲=7, 腕甲=8
 */
function getSlotIdFromSlot(slot: SimulationSlot): string {
  return SIMULATION_SLOT_TO_ID[slot] || "0";
}

/**
 * 从装备槽位获取槽位ID
 */
export function getSlotIdFromEquipmentSlot(slot: EquipmentSlot): string {
  return SLOT_NAME_TO_ID[slot] || "0";
}

/**
 * 将 Equipment 转换为 CalculatorEquipment
 */
export function convertEquipmentToCalculator(
  equipment: Equipment,
  slot: SimulationSlot
): CalculatorEquipment {
  const slotId = getSlotIdFromSlot(slot);
  const equipmentSlot = SLOT_MAPPING[slot];

  return {
    slotId,
    slotName: equipmentSlot,
    name: equipment.name,
    isPurple: equipment.isPurple,
    mainStat: convertAffixToStat(equipment.mainAffix) || undefined,
    dingyinStat: convertAffixToStat(equipment.dingyin) || undefined,
    subStats: equipment.subAffixes
      .map(convertAffixToStat)
      .filter((s): s is CalculatorStat => s !== null),
  };
}

/**
 * 将装备列表转换为计算器需要的格式
 */
export function convertEquipmentsToCalculatorFormat(
  equipments: Equipment[],
  equippedIds: Record<string, string | undefined>
): Record<string, CalculatorEquipment | null> {
  const result: Record<string, CalculatorEquipment | null> = {};

  Object.entries(equippedIds).forEach(([slot, equipmentId]) => {
    if (equipmentId) {
      const equipment = equipments.find((e) => e.id === equipmentId);
      if (equipment) {
        result[slot] = convertEquipmentToCalculator(
          equipment,
          slot as SimulationSlot
        );
      } else {
        result[slot] = null;
      }
    } else {
      result[slot] = null;
    }
  });

  return result;
}

/**
 * 获取所有槽位ID列表
 */
export function getAllSlotIds(): string[] {
  return ["1", "3", "4", "5", "6", "7", "8"];
}

/**
 * 检查槽位是否为武器槽位
 */
export function isWeaponSlot(slotId: string): boolean {
  return slotId === "1";
}
