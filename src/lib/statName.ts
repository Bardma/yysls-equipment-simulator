// src/lib/statName.ts

const STAT_LABELS: Record<string, string> = {
  // Stats panel (noms CN -> EN in-game)
  '外功攻击': 'Physical Attack',
  '鸣金攻击': 'Mingjin Attack',
  '无相攻击': 'Phase-free Attack',
  '精准率': 'Accuracy Rate',
  '会心率': 'Critical Rate',
  '会意率': 'Affinity Rate',
  '直接会心率': 'Direct Critical Rate',
  '直接会意率': 'Direct Affinity Rate',
  '会心伤害加成': 'Critical DMG Bonus',
  '会意伤害加成': 'Affinity DMG Bonus',
  '属攻穿透': 'Attribute Attack Penetration',
  '属攻': 'Attribute Attack',
  '属疗': 'Attribute Healing',
  '鸣金伤害加成': 'Mingjin DMG Bonus',
  '牵丝伤害加成': 'Silkbind DMG Bonus',
  '破竹伤害加成': 'Bamboosplit DMG Bonus',
  '裂石伤害加成': 'Stonesplit DMG Bonus',

  // Base attributes (si présents)
  '体': 'Body',
  '劲': 'Power',
  '御': 'Defense',
  '敏': 'Agility',
  '势': 'Momentum',
};

const SLOT_LABELS: Record<string, string> = {
  '武器': 'Weapon',
  '环': 'Ring',
  '佩': 'Pendant',
  '冠骨': 'Head',
  '胸甲': 'Chest',
  '胫甲': 'Legs',
  '腕甲': 'Hands',
};

const WEAPON_LABELS: Record<string, string> = {
  '剑': 'Sword',
  '枪': 'Spear',
  '伞': 'Umbrella',
  '扇': 'Fan',
  '绳标': 'Rope Dart',
  '双刀': 'Dual Blades',
  '陌刀': 'Long Sabre',
  '横刀': 'Horizontal Sabre',
  '拳甲': 'Gauntlets',
};

// Classes (couvre ce que tu as listé)
const CLASS_LABELS: Record<string, string> = {
  鸣金虹: 'Bellstrike - Umbra',
  鸣金影: 'Bellstrike - Splendor',
  牵丝玉: 'Skillbind - Jade',
  牵丝霖: 'Skillbind - Deluge',
  破竹风: 'Bamboocut - Wind',
  裂石威: 'Stonesplit - Might',
  破竹尘: 'Bamboocut - Dust',
  破竹鸢: 'Bamboocut - Soar',
  裂石钧（双切）: 'Stonesplit - Dualcut',
  裂石钧（纯盾）: 'Stonesplit - Bulwark',
};

// Sets (au moins celui vu + tes noms EN)
const SET_LABELS: Record<string, string> = {
  玉斗: 'Jadeware Set',
  飞隼: 'Hawkwing Set', 
  时雨: 'Rainwhisper Set',
  断岳: 'Formbend Set',
  烟柳: 'Veil of the Willow Set',
  浣花: 'Ivorybloom Set',
  燕归: 'Swallowcall Set',
  连星: 'Eaglerise Set',
  // Ajoute ici toutes les corrélations CN -> EN quand tu les as (la structure est prête).
};

export function slotLabel(cn: string): string {
  return SLOT_LABELS[cn] ?? cn;
}

export function classLabel(name: string): string {
  return CLASS_LABELS[name] ?? name;
}

export function weaponLabel(cn: string): string {
  return WEAPON_LABELS[cn] ?? cn;
}

export function setLabel(name: string): string {
  return SET_LABELS[name] ?? name;
}

// IMPORTANT: une seule fonction statLabel
export function statLabel(key: string): string {
  if (!key) return key;

  // mapping direct prioritaire
  if (STAT_LABELS[key]) return STAT_LABELS[key];

  // patterns min/max
  if (key.startsWith('最小') && key.endsWith('攻击')) {
    const core = key.replace(/^最小/, '').replace(/攻击$/, '');
    return `Min ${STAT_LABELS[core + '攻击'] ?? core} ATK`;
  }
  if (key.startsWith('最大') && key.endsWith('攻击')) {
    const core = key.replace(/^最大/, '').replace(/攻击$/, '');
    return `Max ${STAT_LABELS[core + '攻击'] ?? core} ATK`;
  }

  // fallback “rate/bonus/penetration”
  if (key.endsWith('率')) return (STAT_LABELS[key] ?? key.replace(/率$/, ' Rate'));
  if (key.endsWith('伤害加成')) return (STAT_LABELS[key] ?? key.replace(/伤害加成$/, ' Damage Bonus'));
  if (key.endsWith('穿透')) return (STAT_LABELS[key] ?? key.replace(/穿透$/, ' Penetration'));

  return key;
}