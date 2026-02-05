// Centralized CN->EN display names for stats and related keys.
// Keep original CN keys for logic; only translate for UI display.

const ELEMENT_MAP: Record<string, string> = {
  鸣金: "Mingjin",
  牵丝: "Qiansi",
  破竹: "Pozhu",
  裂石: "Lieshi",
  无相: "Wuxiang",
  外功: "Physical",
  属攻: "Elemental",
};

const WEAPON_EFFICIENCY_MAP: Record<string, string> = {
  剑武学增效: "Sword Skill Efficiency",
  枪武学增效: "Spear Skill Efficiency",
  伞武学增效: "Umbrella Skill Efficiency",
  扇武学增效: "Fan Skill Efficiency",
  绳标武学增效: "Rope Dart Skill Efficiency",
  双刀武学增效: "Dual Blades Skill Efficiency",
  陌刀武学增效: "Modao Skill Efficiency",
  横刀武学增效: "Hengdao Skill Efficiency",
  拳甲武学增效: "Fistguard Skill Efficiency",
};

const DIRECT_MAP: Record<string, string> = {
  // Primary/secondary attributes (common in WWM)
  劲: "Strength",
  敏: "Agility",
  势: "Momentum",
  体: "Vitality",
  御: "Defense",

  精准率: "Accuracy",
  会心率: "Crit Rate",
  会意率: "Insight Rate",
  直接会心率: "Direct Crit Rate",
  直接会意率: "Direct Insight Rate",

  外功穿透: "Physical Penetration",
  属攻穿透: "Elemental Penetration",

  会心伤害加成: "Crit Damage Bonus",
  会意伤害加成: "Insight Damage Bonus",

  外功伤害加成: "Physical Damage Bonus",
  属攻伤害加成: "Elemental Damage Bonus",

  全武学增效: "All Skills Efficiency",
  指定武学增效: "Specific Skill Efficiency",

  对首领单位增伤: "Boss Damage Increase",
  指定武学技能增伤: "Specific Martial Skill Damage Increase",
  单体类奇术增伤: "Single-target Art Damage Increase",
  群体类奇术增伤: "AoE Art Damage Increase",

  武器: "Weapon",
  环: "Ring",
  佩: "Pendant",
  冠胄: "Head Armor",
  外甲: "Chest Armor",
  护腕: "Arm Armor",
  护腿: "Leg Armor",

  // Some UI tokens
  词条: "Stat",
};

function replaceElementPrefix(key: string): string {
  // e.g. 最小鸣金攻击 -> Min Mingjin ATK
  for (const [cn, en] of Object.entries(ELEMENT_MAP)) {
    if (key.includes(cn)) {
      return key.replaceAll(cn, en);
    }
  }
  return key;
}

export function statLabel(cnKey: string): string {
  if (!cnKey) return cnKey;

  // Exact maps
  if (WEAPON_EFFICIENCY_MAP[cnKey]) return WEAPON_EFFICIENCY_MAP[cnKey];
  if (DIRECT_MAP[cnKey]) return DIRECT_MAP[cnKey];

  // Generic patterns
  // 最小X攻击 / 最大X攻击
  const minAtk = cnKey.match(/^最小(.+)攻击$/);
  if (minAtk) {
    const mid = replaceElementPrefix(minAtk[1]);
    return `Min ${mid} ATK`;
  }
  const maxAtk = cnKey.match(/^最大(.+)攻击$/);
  if (maxAtk) {
    const mid = replaceElementPrefix(maxAtk[1]);
    return `Max ${mid} ATK`;
  }

  // X伤害加成 / X增伤 / X增效
  const dmgBonus = cnKey.match(/^(.+)伤害加成$/);
  if (dmgBonus) {
    const mid = replaceElementPrefix(dmgBonus[1]);
    return `${mid} Damage Bonus`;
  }
  const dmgInc = cnKey.match(/^(.+)增伤$/);
  if (dmgInc) {
    const mid = replaceElementPrefix(dmgInc[1]);
    return `${mid} Damage Increase`;
  }
  const eff = cnKey.match(/^(.+)增效$/);
  if (eff) {
    const mid = replaceElementPrefix(eff[1]);
    return `${mid} Efficiency`;
  }

  // X穿透
  const pen = cnKey.match(/^(.+)穿透$/);
  if (pen) {
    const mid = replaceElementPrefix(pen[1]);
    return `${mid} Penetration`;
  }

  // Fallback: element replacement + keep remainder as-is (romanization not attempted here)
  const replaced = replaceElementPrefix(cnKey);

  // If still contains CJK, return as-is to avoid incorrect translations;
  // UI can still display CN for unknown keys until mapped.
  return replaced;
}
