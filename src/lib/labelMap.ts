// src/lib/labelMap.ts
const MAP: Record<string, string> = {
  // Equipment slots
  '武器': 'Weapon',
  '环': 'Ring',
  '佩': 'Pendant',
  '冠骨': 'Head',
  '胸甲': 'Chest',
  '胫甲': 'Legs',
  '腕甲': 'Hands',

  // Weapon types
  '剑': 'Sword',
  '枪': 'Spear',
  '伞': 'Umbrella',
  '扇': 'Fan',
  '绳标': 'Rope Dart',
  '双刀': 'Dual Blades',
  '陌刀': 'Mo Dao (Long Blade)',
  '横刀': 'Heng Dao (Saber)',
  '拳甲': 'Gauntlets',

  // Main / Sub stats (extraits de tes screenshots)
  '最大外功攻击': 'Max External ATK',
  '最小外功攻击': 'Min External ATK',
  '最小无相攻击': 'Min Neutral ATK',
  '最大无相攻击': 'Max Neutral ATK',
  '劲': 'Strength',
  '敏': 'Agility',
  '势': 'Momentum',
  '生存类词条': 'Survivability',

  '会心率': 'Crit Rate',
  '会意率': 'Crit DMG Rate',
  '精准率': 'Accuracy',
};

export const toEnLabel = (raw: unknown): string => {
  const s = String(raw ?? '');
  return MAP[s] ?? s;
};