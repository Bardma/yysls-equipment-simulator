// src/lib/statName.ts

// Labels "slot" (CommonData.SLOTS.name -> EN)
const SLOT_LABELS: Record<string, string> = {
  '武器': 'Weapon',
  '环': 'Ring',
  '佩': 'Pendant',
  '冠骨': 'Head',
  '胸甲': 'Chest',
  '胫甲': 'Legs',
  '腕甲': 'Hands',
};

// Labels "weapon type" (CommonData.WEAPON_TYPES.name -> EN)
const WEAPON_LABELS: Record<string, string> = {
  '剑': 'Sword',
  '枪': 'Spear',
  '伞': 'Umbrella',
  '扇': 'Fan',
  '绳标': 'Rope Dart',
  '双刀': 'Dual Blades',
  '陌刀': 'Mo Dao',
  '横刀': 'Heng Dao',
  '拳甲': 'Fist',
};

// Labels stats (keys venant du jeu/calculator -> EN)
const STAT_LABELS: Record<string, string> = {
  '外功攻击': 'Physical Attack',
  '鸣金攻击': 'Silkbind Attack',
  '无相攻击': 'Attribute Attack',
  '精准率': 'Precision Rate',
  '会心率': 'Critical Rate',
  '会意率': 'Affinity Rate',
  '直接会心率': 'Direct Critical Rate',
  '会心伤害加成': 'Critical DMG Bonus',
  '会意伤害加成': 'Affinity DMG Bonus',
  '会心伤害加成%': 'Critical DMG Bonus',
  '会意伤害加成%': 'Affinity DMG Bonus',
  '属攻穿透': 'Attribute Attack Penetration',
  '物攻穿透': 'Physical Penetration',
  '物理增伤': 'Physical DMG Bonus',
  '物理减伤': 'Physical DMG Reduction',
  // ajoute ici ce que ton calculator renvoie réellement
};

export function slotLabel(input: unknown): string {
  if (typeof input !== 'string') return String(input ?? '');
  return SLOT_LABELS[input] ?? input;
}

export function weaponLabel(input: unknown): string {
  if (typeof input !== 'string') return String(input ?? '');
  return WEAPON_LABELS[input] ?? input;
}

// ✅ UNE SEULE définition
export function statLabel(input: unknown): string {
  if (typeof input !== 'string') return String(input ?? '');
  return STAT_LABELS[input] ?? input;
}