import { EquipmentSlot, WeaponType, AffixType, SimulationSlot } from '@/types';

// 装备槽位列表
export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  '武器',
  '环',
  '佩',
  '冠胄',
  '胸甲',
  '胫甲',
  '腕甲',
];

// 武器种类列表
export const WEAPON_TYPES: WeaponType[] = [
  '剑',
  '枪',
  '伞',
  '扇',
  '绳标',
  '双刀',
  '陌刀',
  '横刀',
  '拳甲',
];

// 模拟槽位列表
export const SIMULATION_SLOTS: SimulationSlot[] = [
  '武器1',
  '武器2',
  '冠胄',
  '胸甲',
  '环',
  '佩',
  '胫甲',
  '腕甲',
];

// 词条类型列表
export const AFFIX_TYPES: AffixType[] = [
  '攻击',
  '攻击百分比',
  '会心',
  '会心伤害',
  '破防',
  '命中',
  '气血',
  '气血百分比',
  '防御',
  '防御百分比',
  '内功攻击',
  '外功攻击',
  '速度',
  '御劲',
  '化劲',
  '闪避',
  '招架',
];

// 心法列表
export const XINFA_LIST = [
  { value: '鸣金虹', label: '鸣金虹' },
  { value: '鸣金影', label: '鸣金影' },
  { value: '破竹尘', label: '破竹尘' },
  { value: '破竹风', label: '破竹风' },
  { value: '破竹鸢', label: '破竹鸢' },
  { value: '裂石威', label: '裂石威' },
  { value: '裂石钧（双切）', label: '裂石钧（双切）' },
  { value: '裂石钧（纯唐）', label: '裂石钧（纯唐）' },
  { value: '牵丝霖', label: '牵丝霖' },
  { value: '牵丝玉', label: '牵丝玉' },
];

// 弓诀列表
export const GONGJUE_LIST = [
  { value: '精准弓', label: '精准弓' },
  { value: '会心弓', label: '会心弓' },
  { value: '会意弓', label: '会意弓' },
];

// 内功列表
export const NEIGONG_LIST = [
  { value: '玉斗', label: '玉斗' },
  { value: '飞隼', label: '飞隼' },
  { value: '时雨', label: '时雨' },
  { value: '断岳', label: '断岳' },
  { value: '烟柳', label: '烟柳' },
  { value: '浣花', label: '浣花' },
  { value: '燕归', label: '燕归' },
  { value: '连星', label: '连星' },
  { value: '撼天', label: '撼天' },
];

// 词条最大值（用于计算毕业率）
export const AFFIX_MAX_VALUES: Record<AffixType, number> = {
  '攻击': 500,
  '攻击百分比': 15,
  '会心': 12,
  '会心伤害': 20,
  '破防': 12,
  '命中': 10,
  '气血': 3000,
  '气血百分比': 15,
  '防御': 300,
  '防御百分比': 15,
  '内功攻击': 500,
  '外功攻击': 500,
  '速度': 10,
  '御劲': 10,
  '化劲': 10,
  '闪避': 10,
  '招架': 10,
};

// 词条权重（用于计算毕业率优先级）
export const AFFIX_WEIGHTS: Record<AffixType, number> = {
  '攻击': 1.0,
  '攻击百分比': 1.2,
  '会心': 1.5,
  '会心伤害': 1.3,
  '破防': 1.4,
  '命中': 0.8,
  '气血': 0.5,
  '气血百分比': 0.6,
  '防御': 0.4,
  '防御百分比': 0.5,
  '内功攻击': 1.0,
  '外功攻击': 1.0,
  '速度': 0.7,
  '御劲': 0.6,
  '化劲': 0.6,
  '闪避': 0.5,
  '招架': 0.5,
};

// 槽位映射：模拟槽位 -> 装备槽位
export const SLOT_MAPPING: Record<SimulationSlot, EquipmentSlot> = {
  '武器1': '武器',
  '武器2': '武器',
  '冠胄': '冠胄',
  '胸甲': '胸甲',
  '环': '环',
  '佩': '佩',
  '胫甲': '胫甲',
  '腕甲': '腕甲',
};

// 应用版本
export const APP_VERSION = '1.0.0';
