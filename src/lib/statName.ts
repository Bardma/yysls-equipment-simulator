// src/lib/statName.ts

const DIRECT_MAP: Record<string, string> = {
  // Base / core stats
  最小外功攻击: 'Min Physical ATK',
  最大外功攻击: 'Max Physical ATK',
  最小无相攻击: 'Min Neutral ATK',
  最大无相攻击: 'Max Neutral ATK',
  精准率: 'Accuracy',
  会心率: 'Crit Rate',
  会意率: 'Insight Rate',
  直接会心率: 'Direct Crit Rate',
  直接会意率: 'Direct Insight Rate',
  会心伤害加成: 'Crit DMG',
  会意伤害加成: 'Insight DMG',
  外功伤害加成: 'Physical Damage Bonus',
  属攻伤害加成: 'Elemental Damage Bonus',
  外功穿透: 'Physical Penetration',
  属攻穿透: 'Elemental Penetration',
  全武学增效: 'All Martial Arts Efficiency',
  指定武学增效: 'Selected Martial Art Efficiency',
  对首领单位增伤: 'Boss Damage Bonus',
  指定武学技能增伤: 'Selected Skill Damage Bonus',
  单体类奇术增伤: 'Single-target Mystic Arts Damage Bonus',
  群体类奇术增伤: 'AoE Mystic Arts Damage Bonus',

  // Primary attributes
  劲: 'Strength (Jing)',
  敏: 'Agility (Min)',
  势: 'Momentum (Shi)',
};

const STAT_LABELS: Record<string, string> = {
  劲: 'Power',
  敏: 'Agility',
  势: 'Momentum',
  体: 'Body',
  御: 'Defense',

  外功攻击: 'Physical Attack',
  外功防御: 'Physical Defense',
  鸣金攻击: 'Metal Attack',
  无相攻击: 'Attribute Attack',

  精准率: 'Precision Rate',
  会心率: 'Critical Rate',
  会意率: 'Affinity Rate',
  直接会心率: 'Direct Critical Rate',
  直接会意率: 'Direct Affinity Rate',

  会心伤害加成: 'Critical DMG Bonus',
  会意伤害加成: 'Affinity DMG Bonus',
  会心治疗加成: 'Critical Healing Bonus',
  外功伤害加成: 'Physical DMG Bonus',
  外功伤害减免: 'Physical DMG Reduction',
  外功治疗加成: 'Physical Healing Bonus',
  无相伤害加成: 'Attribute Attack DMG Bonus',
  无相治疗加成: 'Attribute Attack Healing Bonus',

  属攻穿透: 'Attribute Attack Penetration',
  外功穿透: 'Physical Penetration',
  外功抗性: 'Physical Resistance',

  最大气血: 'Max HP',
  最大真气: 'Max Qi',
};

const SCHOOL_MAP: Array<[RegExp, string]> = [
  [/鸣金/g, 'Bellstrike'],
  [/裂石/g, 'Stonesplit'],
  [/牵丝/g, 'Silkbind'],
  [/破竹/g, 'Bamboosplit'],
  [/无相/g, 'Formless'],
];

const WEAPON_MAP: Array<[RegExp, string]> = [
  [/剑/g, 'Sword'],
  [/枪/g, 'Spear'],
  [/伞/g, 'Umbrella'],
  [/扇/g, 'Fan'],
  [/绳标/g, 'Rope Dart'],
  [/双刀/g, 'Dual Blades'],
  [/陌刀/g, 'Long Sabre'],
  [/横刀/g, 'Horizontal Sabre'],
  [/拳甲/g, 'Gauntlets'],
];

const SLOT_MAP: Array<[RegExp, string]> = [
  [/戒指/g, 'Ring'],
  [/玉佩/g, 'Pendant'],
  [/头/g, 'Head'],
  [/头部/g, 'Head'],
  [/胸/g, 'Chest'],
  [/上衣/g, 'Chest'],
  [/腿/g, 'Legs'],
  [/腿部/g, 'Legs'],
  [/手/g, 'Hands'],
  [/护手/g, 'Hands'],
  [/武器/g, 'Weapon'],
];

function applyMaps(input: string, maps: Array<[RegExp, string]>) {
  let out = input;
  for (const [re, rep] of maps) out = out.replace(re, rep);
  return out;
}

export function weaponLabel(name: string): string {
  if (!name) return name;
  return applyMaps(name, WEAPON_MAP);
}

export function slotLabel(name: string): string {
  if (!name) return name;
  return applyMaps(name, SLOT_MAP);
}

function statLabelFromKey(key: string): string {
  if (!key) return key;
  if (STAT_LABELS[key]) return STAT_LABELS[key];
  if (DIRECT_MAP[key]) return DIRECT_MAP[key];

  // Generic patterns
  const schoolThenWeapon = (s: string) => applyMaps(applyMaps(s, SCHOOL_MAP), WEAPON_MAP);

  if (key.startsWith('最小') && key.endsWith('攻击')) {
    return 'Min ' + schoolThenWeapon(key.replace(/^最小/, '').replace(/攻击$/, ' ATK'));
  }
  if (key.startsWith('最大') && key.endsWith('攻击')) {
    return 'Max ' + schoolThenWeapon(key.replace(/^最大/, '').replace(/攻击$/, ' ATK'));
  }
  if (key.endsWith('武学增效')) {
    const base = key.replace(/武学增效$/, '').trim();
    return schoolThenWeapon(base) + ' Martial Arts Efficiency';
  }
  if (key.endsWith('伤害加成')) {
    const base = key.replace(/伤害加成$/, '').trim();
    return schoolThenWeapon(base) + ' Damage Bonus';
  }
  if (key.endsWith('穿透')) {
    const base = key.replace(/穿透$/, '').trim();
    return schoolThenWeapon(base) + ' Penetration';
  }

  if (key.includes('率')) return schoolThenWeapon(key).replace(/率/g, ' Rate');
  if (key.includes('增伤')) return schoolThenWeapon(key).replace(/增伤/g, ' Damage Bonus');

  return schoolThenWeapon(key);
}

export function statLabel(stat: unknown): string {
  if (typeof stat === 'string') return statLabelFromKey(stat);
  if (stat && typeof stat === 'object') {
    const s = stat as any;
    const key = s.type ?? s.name ?? s.label;
    if (typeof key === 'string') return statLabelFromKey(key);
  }
  return String(stat);
}