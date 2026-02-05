import { statLabel } from '@/lib/statName';
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

  // Primary attributes (no official EN label found on the 3 reference sites; keep clear EN with CN hint)
  劲: 'Strength (Jing)',
  敏: 'Agility (Min)',
  势: 'Momentum (Shi)',
};
const STAT_LABELS: Record<string, string> = {
  // Core
  '劲': 'Power',
  '敏': 'Agility',
  '势': 'Momentum',
  '体': 'Body',
  '御': 'Defense',

  // Attacks/Def
  '外功攻击': 'Physical Attack',
  '外功防御': 'Physical Defense',
  '鸣金攻击': 'Metal Attack',
  '无相攻击': 'Attribute Attack',

  // Rates
  '精准率': 'Precision Rate',
  '会心率': 'Critical Rate',
  '会意率': 'Affinity Rate',
  '直接会心率': 'Direct Critical Rate',
  '直接会意率': 'Direct Affinity Rate',

  // Bonuses
  '会心伤害加成': 'Critical DMG Bonus',
  '会意伤害加成': 'Affinity DMG Bonus',
  '会心治疗加成': 'Critical Healing Bonus',
  '外功伤害加成': 'Physical DMG Bonus',
  '外功伤害减免': 'Physical DMG Reduction',
  '外功治疗加成': 'Physical Healing Bonus',
  '无相伤害加成': 'Attribute Attack DMG Bonus',
  '无相治疗加成': 'Attribute Attack Healing Bonus',

  // Penetration / Resistance
  '属攻穿透': 'Attribute Attack Penetration',
  '外功穿透': 'Physical Penetration',
  '外功抗性': 'Physical Resistance',

  // HP/Qi (si tu as les clés exactes)
  '最大气血': 'Max HP',
  '最大真气': 'Max Qi',

  // etc...
};

export function statLabel(stat: unknown): string {
  if (typeof stat === 'string') return STAT_LABELS[stat] ?? stat;
  if (stat && typeof stat === 'object') {
    const s = stat as any;
    const key = s.type ?? s.name ?? s.label;
    if (typeof key === 'string') return STAT_LABELS[key] ?? key;
  }
  return String(stat);
}
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

function applyMaps(input: string) {
  let out = input;
  for (const [re, rep] of SCHOOL_MAP) out = out.replace(re, rep);
  for (const [re, rep] of WEAPON_MAP) out = out.replace(re, rep);
  return out;
}

export function statLabel(key: string): string {
  if (!key) return key;

  if (DIRECT_MAP[key]) return DIRECT_MAP[key];

  // Common patterns
  if (key.startsWith('最小') && key.endsWith('攻击')) {
    return 'Min ' + applyMaps(key.replace(/^最小/, '').replace(/攻击$/, ' ATK'));
  }
  if (key.startsWith('最大') && key.endsWith('攻击')) {
    return 'Max ' + applyMaps(key.replace(/^最大/, '').replace(/攻击$/, ' ATK'));
  }

  if (key.endsWith('武学增效')) {
    const base = key.replace(/武学增效$/, '').trim();
    return applyMaps(base) + ' Martial Arts Efficiency';
  }

  if (key.endsWith('伤害加成')) {
    const base = key.replace(/伤害加成$/, '').trim();
    return applyMaps(base) + ' Damage Bonus';
  }

  if (key.endsWith('穿透')) {
    const base = key.replace(/穿透$/, '').trim();
    return applyMaps(base) + ' Penetration';
  }

  // Percent-like
  if (key.includes('率')) return applyMaps(key).replace(/率/g, ' Rate');
  if (key.includes('增伤')) return applyMaps(key).replace(/增伤/g, ' Damage Bonus');

  return applyMaps(key);
}
