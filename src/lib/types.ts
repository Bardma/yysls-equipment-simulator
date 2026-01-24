export type StatType = string;

export interface StatValue {
  type: StatType;
  value: number;
  isPercent?: boolean;
}

export interface EquipItem {
  id: number | string;
  slotId: string;
  slotName: string;
  weaponTypeId?: string | null;
  name: string;
  isChengyin?: boolean;
  isPurple?: boolean;
  isConvertible?: boolean;
  icon: string;
  mainStat: StatValue;
  dingyinStat?: StatValue | null;
  subStats: StatValue[];
}

export interface EquippedItems {
  weapon1: EquipItem | null;
  weapon2: EquipItem | null;
  head: EquipItem | null;
  chest: EquipItem | null;
  ring: EquipItem | null;
  pendant: EquipItem | null;
  legs: EquipItem | null;
  hands: EquipItem | null;
}

export interface SlotDefinition {
  id: string;
  name: string;
  icon: string;
}

export interface WeaponTypeDefinition {
  id: string;
  name: string;
  icon: string;
  stat: StatType;
}

export interface RotationAction {
  name: string;
  count: number;
  isDingyin: boolean;
  generalBonus: number;
  included: boolean;
  yishui: number;
  yongquan?: 'TRUE' | 'FALSE';
}

export interface RotationConfig {
  rotation: RotationAction[];
  baseline: number;
  updateTime: string;
  version: string;
  author: string;
  skillDatabase: Record<string, SkillDataEntry>;
  useTime: number;
}

export interface ClassConfigData {
  CLASSES: string[];
  WEAPON_RULES: Record<string, string[]>;
  DEFAULT_SETS: Record<string, string>;
  XINFA_RULES: Record<string, { default: string[]; extra: string[] }>;
  XINFA_LOCKED: Record<string, string[]>;
  ROTATIONS: Record<string, RotationConfig>;
}

export interface CommonDataType {
  BASE_STATS: Record<StatType, number>;
  PERCENT_STATS: StatType[];
  BASE_SUB_STATS: StatType[];
  SLOTS: SlotDefinition[];
  WEAPON_TYPES: WeaponTypeDefinition[];
  MAX_VALUES: Record<StatType, number>;
  MAIN_STAT_RULES: Record<string, StatType[]>;
  DINGYIN_RULES: Record<string, StatType[]>;
  SET_DATA: Record<string, Record<StatType, number>>;
  XINFA_DATA: Record<string, Record<StatType, number>>;
  XINFA_LIST: string[];
  GENERIC_XINFA: string[];
  TRANSMUTATION_POOLS: Record<string, StatType[]>;
}

export interface SkillDataModifiers {
  [key: string]: number | boolean;
}

export interface SkillDataEntry {
  modifiers: SkillDataModifiers;
  outerRatio: number;
  fixed: number;
  eleRatio: number;
  exMinATK: number;
  exMaxATK: number;
  exATK: number;
  exCrit: number;
  exCritDmg: number;
  exIntent: number;
  exIntentDmg: number;
  exDmg: number;
  exPen: number;
  isCharge: number;
  type: string;
  weaponType: string;
  element: string;
  special: string;
  force: string;
}

export interface CalculatorStatModifier {
  type: StatType;
  value: number;
  isPercent?: boolean;
  operation: 'add' | 'remove';
}

export interface GraduationRateResult {
  totalDamage: number;
  graduationRate: string;
  debugInfo?: {
    avgOuterAtk?: number;
  };
}
