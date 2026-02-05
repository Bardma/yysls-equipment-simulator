// src/lib/statName.ts

const STAT_LABELS: Record<string, string> = {
  // Stats panel (noms CN -> EN in-game)
  '外功攻击': 'Physical Attack',
  '鸣金攻击': 'Attribute Attack',
  '无相攻击': 'Formless Attribute',
  '破竹攻击': 'Bamboocut Attack',
  '牵丝攻击': 'Silkbond Attack',
  '裂石攻击': 'Stonesplit Attack',
  '精准率': 'Precision Rate',
  '会心率': 'Critical Rate',
  '会意率': 'Affinity Rate',
  '直接会心率': 'Direct Critical Rate',
  '直接会意率': 'Direct Affinity Rate',
  '会心伤害加成': 'Critical DMG Bonus',
  '会意伤害加成': 'Affinity DMG Bonus',
  '属攻穿透': 'Attribute Attack Penetration',
  '属攻': 'Attribute Attack',
  '属疗': 'Attribute Healing',
  '鸣金伤害加成': 'Attribute DMG Bonus',
  '牵丝伤害加成': 'Silkbond DMG Bonus',
  '破竹伤害加成': 'Bamboocut DMG Bonus',
  '裂石伤害加成': 'Stonesplit DMG Bonus',

  // Base attributes (si présents)
  '体': 'Body',
  '劲': 'Power',
  '御': 'Defense',
  '敏': 'Agility',
  '势': 'Momentum',
  '最大气血': 'Max HP',
  '最大真气': 'Max Qi',
  '外功防御': 'Physical Defense',
  '外功穿透': 'Physical Penetration',
  '外功抗性': 'Physical Resistance',
  '磨砺转化率': 'Abrasion Conversion Rate',
  '会心治疗加成': 'Critical Healing Bonus',
  '外功治疗加成': 'Physical Healing Bonus',
  '外功减伤': 'Physical DMG Reduction',
  '外功伤害加成': 'Physical DMG Bonus',
  '属攻伤害加成': 'Attribute Attack DMG Bonus',
  '属疗加成': 'Attribute Attack Healing Bonus',
  '生存类词条': 'Survivability',
  '生存向': 'Survivability',
  '无': 'None',
};

const XINFA_LABELS: Record<string, string> = {
  '剑气纵横': 'Sword Horizon',
  '千营一呼': 'Morale Chant',
  '君臣药': 'Royal Remedy',
  '山河绝韵': 'Exquisite Scenery',
  '忘川绝响': 'Echoes of Oblivion',
  '扶摇直上': 'Wind Beneath Wings',
  '无名心法': 'Esoteric Revival',
  '易水歌': 'Evening Snow',
  '花上月令': 'Blossom Barrage',
  '霜天白夜': 'Bitter Seasons',
  '三穷致知': 'Insightful Strike',
  '凝神章': 'Steadfast Stance',
  '千丝蛊': 'Fivefold Bleed',
  '千山法': "Mountain's Might",
  '大唐歌': 'Battle Anthem',
  '威猛歌': 'Envigorated Warrior',
  '孤忠不辞': 'Vendetta',
  '征人归': 'Riptide Reflex',
  '心弥泥鱼': 'Mending Loom',
  '怒斩马': 'Trapped Beast',
  '所恨年年': 'Seasonal Edge',
  '抗造大法': 'Art of Resistance',
  '擒天势': 'Star Reacher',
  '断石之构': 'Breaking Point',
  '明晦同尘': 'Shadow Assault',
  '春雷篇': 'Thunderous Bloom',
  '杏花不见': 'Restoring Blossom',
  '灯儿亮': 'Flying Gourds',
  '移经易武': 'Sword Morph',
  '穿喉决': 'Fury Harvest',
  '纵地摘星': 'Divine Roulette',
  '绳舟行木': 'Evasive Charge',
  '逐狼心经': "Wolfchaser's Art",
  '极乐泣血': 'Vital Leech',
};

const SLOT_LABELS: Record<string, string> = {
  '武器': 'Weapon',
  '环': 'Ring',
  '佩': 'Pendant',
  '冠骨': 'Head',
  '冠胄': 'Head',
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
export const CLASS_LABELS: Record<string, string> = {
  '鸣金虹': 'Bellstrike - Umbra',
  '鸣金影': 'Bellstrike - Splendor',
  '破竹尘': 'Bamboocut - Dust',
  '破竹风': 'Bamboocut - Wind',
  '破竹鸢': 'Bamboocut - Soar',
  '裂石威': 'Stonesplit - Might',
  '裂石钧（双切）': 'Stonesplit - Dualcut',
  '裂石钧（纯盾）': 'Stonesplit - Bulwark',
  '牵丝霖': 'Silkbind - Deluge',
  '牵丝玉': 'Silkbind - Jade',
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

export function xinfaLabel(name: string): string {
  return XINFA_LABELS[name] ?? name;
}

// IMPORTANT: une seule fonction statLabel
export function statLabel(key: string): string {
  if (!key) return key;

  // mapping direct prioritaire
  if (STAT_LABELS[key]) return STAT_LABELS[key];

  // patterns min/max
  if (key.startsWith('最小') && key.endsWith('攻击')) {
    const core = key.replace(/^最小/, '').replace(/攻击$/, '');
    const target = STAT_LABELS[core + '攻击'] ?? core;
    return /(Attack|Attribute)$/i.test(target) ? `Min ${target}` : `Min ${target} ATK`;
  }
  if (key.startsWith('最大') && key.endsWith('攻击')) {
    const core = key.replace(/^最大/, '').replace(/攻击$/, '');
    const target = STAT_LABELS[core + '攻击'] ?? core;
    return /(Attack|Attribute)$/i.test(target) ? `Max ${target}` : `Max ${target} ATK`;
  }

  // fallback “rate/bonus/penetration”
  if (key.endsWith('率')) return (STAT_LABELS[key] ?? key.replace(/率$/, ' Rate'));
  if (key.endsWith('伤害加成')) return (STAT_LABELS[key] ?? key.replace(/伤害加成$/, ' Damage Bonus'));
  if (key.endsWith('穿透')) return (STAT_LABELS[key] ?? key.replace(/穿透$/, ' Penetration'));

  return key;
}
