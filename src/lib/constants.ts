import {
  EquipmentSlot,
  WeaponType,
  StatName,
  SimulationSlot,
  SlotId,
} from "@/types";
import { MAX_VALUES, SET_DATA, XINFA_DATA } from "./commonData";
import { CLASSES } from "./classConfig";

// 装备槽位列表
export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  "武器",
  "环",
  "佩",
  "冠胄",
  "胸甲",
  "胫甲",
  "腕甲",
];

// 武器种类列表
export const WEAPON_TYPES: WeaponType[] = [
  "剑",
  "枪",
  "伞",
  "扇",
  "绳标",
  "双刀",
  "陌刀",
  "横刀",
  "拳甲",
];

// 模拟槽位列表
export const SIMULATION_SLOTS: SimulationSlot[] = [
  "武器1",
  "武器2",
  "冠胄",
  "胸甲",
  "环",
  "佩",
  "胫甲",
  "腕甲",
];

// 槽位ID列表（按正确顺序）
export const SLOT_IDS: SlotId[] = ["1", "3", "4", "5", "6", "7", "8"];

// 常用属性类型列表（用于UI选择）
export const STAT_TYPES: StatName[] = [
  "最小外功攻击",
  "最大外功攻击",
  "会心率",
  "会意率",
  "精准率",
  "劲",
  "敏",
  "势",
  "会心伤害加成",
  "会意伤害加成",
  "外功穿透",
  "属攻穿透",
  "全武学增效",
  "指定武学技能增伤",
  "对首领单位增伤",
];

// 属攻类型列表
export const ELEMENTAL_STAT_TYPES: StatName[] = [
  "最小鸣金攻击",
  "最大鸣金攻击",
  "最小裂石攻击",
  "最大裂石攻击",
  "最小牵丝攻击",
  "最大牵丝攻击",
  "最小破竹攻击",
  "最大破竹攻击",
];

// 流派列表（从 classConfig 导入）
export const CLASS_LIST = CLASSES.map((name) => ({
  value: name,
  label: name,
}));

// 套装列表（从 commonData 导入）
export const SET_LIST = Object.keys(SET_DATA).map((name) => ({
  value: name,
  label: name,
}));

// 心法列表（从 commonData 导入）
export const XINFA_LIST_ALL = Object.keys(XINFA_DATA).map((name) => ({
  value: name,
  label: name,
}));

// 词条最大值（从 commonData 导入，并转换为可索引格式）
export const AFFIX_MAX_VALUES: Record<string, number> = MAX_VALUES;

// 词条权重（用于计算毕业率优先级）
export const AFFIX_WEIGHTS: Record<string, number> = {
  最大外功攻击: 1.0,
  最小外功攻击: 1.0,
  会心率: 1.5,
  会意率: 1.3,
  精准率: 0.8,
  劲: 0.9,
  敏: 0.9,
  势: 0.9,
  会心伤害加成: 1.3,
  会意伤害加成: 1.1,
  外功穿透: 1.4,
  属攻穿透: 1.4,
  全武学增效: 1.2,
  指定武学技能增伤: 1.1,
  对首领单位增伤: 1.1,
  // 属攻
  最大鸣金攻击: 1.0,
  最小鸣金攻击: 1.0,
  最大裂石攻击: 1.0,
  最小裂石攻击: 1.0,
  最大牵丝攻击: 1.0,
  最小牵丝攻击: 1.0,
  最大破竹攻击: 1.0,
  最小破竹攻击: 1.0,
};

// 槽位映射：模拟槽位 -> 装备槽位
export const SLOT_MAPPING: Record<SimulationSlot, EquipmentSlot> = {
  武器1: "武器",
  武器2: "武器",
  冠胄: "冠胄",
  胸甲: "胸甲",
  环: "环",
  佩: "佩",
  胫甲: "胫甲",
  腕甲: "腕甲",
};

// 槽位ID映射：模拟槽位 -> 槽位ID
export const SLOT_ID_MAPPING: Record<SimulationSlot, SlotId> = {
  武器1: "1",
  武器2: "1",
  环: "3",
  佩: "4",
  冠胄: "5",
  胸甲: "6",
  胫甲: "7",
  腕甲: "8",
};

// 应用版本
export const APP_VERSION = "1.0.0";
