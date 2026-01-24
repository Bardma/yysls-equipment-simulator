// 角色
export interface Character {
  id: string;
  name: string;
  createdAt: number;
}

// 装备位置
export type EquipmentSlot = '武器' | '环' | '佩' | '冠胄' | '胸甲' | '胫甲' | '腕甲';

// 武器种类
export type WeaponType = '剑' | '枪' | '伞' | '扇' | '绳标' | '双刀' | '陌刀' | '横刀' | '拳甲';

// 词条类型
export type AffixType =
  | '攻击'
  | '攻击百分比'
  | '会心'
  | '会心伤害'
  | '破防'
  | '命中'
  | '气血'
  | '气血百分比'
  | '防御'
  | '防御百分比'
  | '内功攻击'
  | '外功攻击'
  | '速度'
  | '御劲'
  | '化劲'
  | '闪避'
  | '招架';

// 词条
export interface Affix {
  type: AffixType | '';
  value: number;
  isPercent: boolean;
}

// 装备
export interface Equipment {
  id: string;
  characterId: string;
  slot: EquipmentSlot;
  weaponType?: WeaponType;
  name: string;
  isChengyin: boolean;   // 承音
  isPurple: boolean;     // 紫装
  canTransfer: boolean;  // 可转律
  mainAffix: Affix;      // 主词条
  subAffixes: Affix[];   // 副词条 (4条)
  dingyin: Affix;        // 定音词条
  createdAt: number;
}

// 穿戴配置
export interface SimulationConfig {
  xinfa: string;         // 心法
  gongJue: string;       // 弓诀
  neiGong: string;       // 内功
  equippedIds: Record<string, string | undefined>; // 槽位 -> 装备ID
  useNextSeason: boolean;
  freezeDingyin: boolean;
  assumeFullChengyin: boolean;
}

// 装备槽位类型（用于穿戴模拟）
export type SimulationSlot =
  | '武器1'
  | '武器2'
  | '冠胄'
  | '胸甲'
  | '环'
  | '佩'
  | '胫甲'
  | '腕甲';

// 导出数据结构
export interface ExportData {
  version: string;
  exportTime: number;
  character: Character;
  equipments: Equipment[];
  simulationConfig: SimulationConfig;
}
