/**
 * 游戏类型定义
 * 与 commonData.ts 和 classConfig.ts 中的数据结构对齐
 */

// 角色
export interface Character {
  id: string;
  name: string;
  createdAt: number;
}

// 槽位ID类型（与 CommonData.SLOTS 对应）
export type SlotId = "1" | "3" | "4" | "5" | "6" | "7" | "8";

// 装备位置（中文名称）
export type EquipmentSlot =
  | "武器"
  | "环"
  | "佩"
  | "冠胄"
  | "胸甲"
  | "胫甲"
  | "腕甲";

// 武器种类
export type WeaponType =
  | "剑"
  | "枪"
  | "伞"
  | "扇"
  | "绳标"
  | "双刀"
  | "陌刀"
  | "横刀"
  | "拳甲";

// 武器类型ID
export type WeaponTypeId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

// 具体属性名称类型（对应游戏中的实际属性）
export type StatName =
  // 攻击属性
  | "最小外功攻击"
  | "最大外功攻击"
  | "最小无相攻击"
  | "最大无相攻击"
  | "最小鸣金攻击"
  | "最大鸣金攻击"
  | "最小裂石攻击"
  | "最大裂石攻击"
  | "最小牵丝攻击"
  | "最大牵丝攻击"
  | "最小破竹攻击"
  | "最大破竹攻击"
  // 基础属性
  | "劲"
  | "敏"
  | "势"
  // 率类属性
  | "精准率"
  | "会心率"
  | "会意率"
  | "直接会心率"
  | "直接会意率"
  // 伤害加成
  | "会心伤害加成"
  | "会意伤害加成"
  | "外功伤害加成"
  | "属攻伤害加成"
  // 穿透
  | "外功穿透"
  | "属攻穿透"
  | "无相穿透"
  // 增效
  | "全武学增效"
  | "指定武学增效"
  | "对首领单位增伤"
  | "指定武学技能增伤"
  | "单体类奇术增伤"
  | "群体类奇术增伤"
  // 武器增效
  | "剑武学增效"
  | "枪武学增效"
  | "伞武学增效"
  | "扇武学增效"
  | "绳标武学增效"
  | "双刀武学增效"
  | "陌刀武学增效"
  | "横刀武学增效"
  | "拳甲武学增效"
  // 流派伤害加成
  | "鸣金伤害加成"
  | "裂石伤害加成"
  | "牵丝伤害加成"
  | "破竹伤害加成"
  // 生存类词条占位
  | "生存类词条";

// 向后兼容：AffixType 作为 StatName 的别名
export type AffixType = StatName;

// 定音类型
export type DingyinType =
  | "无"
  | "外功穿透"
  | "属攻穿透"
  | "指定武学技能增伤";

// 词条（保持向后兼容，同时支持新的属性名系统）
export interface Affix {
  type: StatName | "";
  value: number;
  isPercent: boolean;
}

// 装备
export interface Equipment {
  id: string;
  characterId: string;
  slot: EquipmentSlot;
  slotId?: SlotId; // 可选，用于直接存储槽位ID
  weaponType?: WeaponType;
  weaponTypeId?: WeaponTypeId; // 可选，用于直接存储武器类型ID
  name: string;
  isChengyin: boolean; // 承音
  isPurple: boolean; // 紫装
  canTransfer: boolean; // 可转律
  mainAffix: Affix; // 主词条
  subAffixes: Affix[]; // 副词条 (4条)
  dingyin: Affix; // 定音词条
  createdAt: number;
}

// 心法槽位配置（4槽位系统）
export interface XinfaLoadout {
  slot1: string;
  slot2: string;
  slot3: string;
  slot4: string;
}

// 穿戴配置
export interface SimulationConfig {
  className: string; // 流派名称
  xinfaLoadout: XinfaLoadout; // 心法4槽位
  setName: string; // 套装名称
  equippedIds: Record<string, string | undefined>; // 槽位 -> 装备ID
  useEarlySeason: boolean; // 早期赛季加成
  freezeDingyin: boolean; // 锁定定音
  assumeFullChengyin: boolean; // 假设满承音
}

// 装备槽位类型（用于穿戴模拟）
export type SimulationSlot =
  | "武器1"
  | "武器2"
  | "冠胄"
  | "胸甲"
  | "环"
  | "佩"
  | "胫甲"
  | "腕甲";

// 槽位名称到ID的映射
export const SLOT_NAME_TO_ID: Record<EquipmentSlot, SlotId> = {
  武器: "1",
  环: "3",
  佩: "4",
  冠胄: "5",
  胸甲: "6",
  胫甲: "7",
  腕甲: "8",
};

// 槽位ID到名称的映射
export const SLOT_ID_TO_NAME: Record<SlotId, EquipmentSlot> = {
  "1": "武器",
  "3": "环",
  "4": "佩",
  "5": "冠胄",
  "6": "胸甲",
  "7": "胫甲",
  "8": "腕甲",
};

// 武器类型名称到ID的映射
export const WEAPON_NAME_TO_ID: Record<WeaponType, WeaponTypeId> = {
  剑: "1",
  枪: "2",
  伞: "3",
  扇: "4",
  绳标: "5",
  双刀: "6",
  陌刀: "7",
  横刀: "8",
  拳甲: "9",
};

// 武器类型ID到名称的映射
export const WEAPON_ID_TO_NAME: Record<WeaponTypeId, WeaponType> = {
  "1": "剑",
  "2": "枪",
  "3": "伞",
  "4": "扇",
  "5": "绳标",
  "6": "双刀",
  "7": "陌刀",
  "8": "横刀",
  "9": "拳甲",
};

// 导出数据结构
export interface ExportData {
  version: string;
  exportTime: number;
  character: Character;
  equipments: Equipment[];
  simulationConfig: SimulationConfig;
}

// 计算结果接口
export interface CalculationResult {
  totalDamage: number;
  dps: number;
  graduationRate: number;
  stats: Record<string, number>;
}
