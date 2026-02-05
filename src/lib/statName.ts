// src/lib/statName.ts

const STAT_LABELS: Record<string, string> = {
  // Stats panel (noms CN -> EN in-game)
  '外功攻击': 'Physical Attack',
  '鸣金攻击': 'Mingjin Attack',
  '无相攻击': 'Phase-free Attack',
  '精准率': 'Precision Rate',
  '实际精准率': 'Precision Rate',
  '会心率': 'Critical Rate',
  '实际会心率': 'Critical Rate',
  '会意率': 'Affinity Rate',
  '实际会意率': 'Affinity Rate',
  '直接会心率': 'Direct Critical Rate',
  '直接会意率': 'Direct Affinity Rate',
  '会心伤害加成': 'Critical DMG Bonus',
  '会意伤害加成': 'Affinity DMG Bonus',
  '会心治疗加成': 'Critical Healing Bonus',
  '属攻穿透': 'Attribute Attack Penetration',
  '属攻': 'Attribute Attack',
  '属疗': 'Attribute Healing',
  '外功防御': 'Physical Defense',
  '外功穿透': 'Physical Penetration',
  '外功伤害加成': 'Physical DMG Bonus',
  '外功伤害减免': 'Physical DMG Reduction',
  '外功治疗加成': 'Physical Healing Bonus',
  '属攻伤害加成': 'Attribute Attack DMG Bonus',
  '属攻治疗加成': 'Attribute Attack Healing Bonus',
  '裂伤转化率': 'Abrasion Conversion Rate',
  '最大气血': 'Max HP',
  '气血上限': 'Max HP',
  '最大真气': 'Max Qi',
  '真气上限': 'Max Qi',
  '鸣金伤害加成': 'Mingjin DMG Bonus',
  '牵丝伤害加成': 'Silkbind DMG Bonus',
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
  '鸣金穿透': 'Bellstrike Penetration',
  '裂石穿透': 'Stonesplit Penetration',
  '牵丝穿透': 'Silkbind Penetration',
  '破竹穿透': 'Bamboocut Penetration',
  '生存类词条': 'Survivability',
  '生存向': 'Survivability',
  '无': 'None',
};


const ATTUNEMENT_TEXT_LABELS: Record<string, string> = {
  'Stonesplit Pentration': 'Stonesplit Penetration',
  "Deal bonus Qi damage when breaking a target's defense with a Defense Break skill": "Deal bonus Qi damage when breaking a target's defense with a Defense Break skill",
  'Gain Tenacity for a short period after damaging a target with a Counterattack skill': 'Gain Tenacity for a short period after damaging a target with a Counterattack skill',
  'Recover Endurance after casting an Execution skill': 'Recover Endurance after casting an Execution skill',
  "Increase the target's damage taken after breaking their defense with a Defense Break skill": "Increase the target's damage taken after breaking their defense with a Defense Break skill",
  'Deal bonus Qi damage when hitting a non-defending enemy with a Counterattack skill': 'Deal bonus Qi damage when hitting a non-defending enemy with a Counterattack skill',
  'Recover Vitality after casting an Execution skill': 'Recover Vitality after casting an Execution skill',
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
  '冠胄': 'Head',
  '冠骨': 'Head',
  '冠胄': 'Head',
  '胸甲': 'Chest',
  '胫甲': 'Legs',
  '腕甲': 'Hands',
};

const XINFA_LABELS: Record<string, string> = {
  '抗造大法': 'Adaptive Steel',
  '孤忠不辞': 'Art of Resistance',
  '千营一呼': 'Battle Anthem',
  '所恨年年': 'Bitter Seasons',
  '杏花不见': 'Blossom Barrage',
  '断石之构': 'Breaking Point',
  '君臣药': 'Divine Roulette',
  '忘川绝响': 'Echoes of Oblivion',
  '威猛歌': 'Envigorated Warrior',
  '移经易武': 'Esoteric Revival',
  '扶摇直上': 'Evasive Charge',
  '霜天白夜': 'Evening Snow',
  '山河绝韵': 'Exquisite Scenery',
  '极乐泣血': 'Fivefold Bleed',
  '绳舟行木': 'Flying Gourds',
  '怒斩马': 'Fury Harvest',
  '三穷致知': 'Insightful Strike',
  '千丝蛊': 'Mending Loom',
  '大唐歌': 'Morale Chant',
  '擒天势': "Mountain's Might",
  '花上月令': 'Restoring Blossom',
  '心弥泥鱼': 'Riptide Reflex',
  '无名心法': 'Royal Remedy',
  '春雷篇': 'Seasonal Edge',
  '凝神章': 'Shadow Assault',
  '纵地摘星': 'Star Reacher',
  '征人归': 'Steadfast Stance',
  '剑气纵横': 'Sword Horizon',
  '易水歌': 'Sword Morph',
  '灯儿亮': 'Thunderous Bloom',
  '穿喉决': 'Trapped Beast',
  '明晦同尘': 'Vital Leech',
  '逐狼心经': "Wolfchaser's Art",
  '千山法': 'Wind Beneath Wings',
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
  '鸣金虹': 'Bellstrike - Splendor',
  '鸣金影': 'Bellstrike - Umbra',
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
  if (ATTUNEMENT_TEXT_LABELS[key]) return ATTUNEMENT_TEXT_LABELS[key];

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
