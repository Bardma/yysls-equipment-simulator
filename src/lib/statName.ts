// src/lib/statName.ts

// Centralise tous les labels EN (pas de CN affiché).
// Si une clé est inconnue, on renvoie la clé telle quelle.

const STAT_LABELS: Record<string, string> = {
  Body: "Body",
  Power: "Power",
  Defense: "Defense",
  Agility: "Agility",
  Momentum: "Momentum",

  "Max HP": "Max HP",
  "Max Qi": "Max Qi",
  "Physical Attack": "Physical Attack",
  "Physical Defense": "Physical Defense",

  "Precision Rate": "Precision Rate",
  "Critical Rate": "Critical Rate",
  "Affinity Rate": "Affinity Rate",

  "Abrasion Conversion Rate": "Abrasion Conversion Rate",
  "Direct Critical Rate": "Direct Critical Rate",

  "Attribute Attack": "Attribute Attack",
  "Attribute Healing": "Attribute Healing",

  "Critical DMG Bonus": "Critical DMG Bonus",
  "Affinity DMG Bonus": "Affinity DMG Bonus",
  "Critical Healing Bonus": "Critical Healing Bonus",

  "Physical Penetration": "Physical Penetration",
  "Physical Resistance": "Physical Resistance",
  "Attribute Attack Penetration": "Attribute Attack Penetration",

  "Physical DMG Bonus": "Physical DMG Bonus",
  "Physical DMG Reduction": "Physical DMG Reduction",
  "Physical Healing Bonus": "Physical Healing Bonus",

  "Attribute Attack DMG Bonus": "Attribute Attack DMG Bonus",
  "Attribute Attack Healing Bonus": "Attribute Attack Healing Bonus",
};

// Slots (si CommonData renvoie des noms CN, on les convertit ici)
const SLOT_LABELS: Record<string, string> = {
  Weapon: "Weapon",
  Ring: "Ring",
  Pendant: "Pendant",
  Head: "Head",
  Chest: "Chest",
  Legs: "Legs",
  Hands: "Hands",
};

// Types d’armes (idem)
const WEAPON_LABELS: Record<string, string> = {
  Sword: "Sword",
  Spear: "Spear",
  Blade: "Blade",
  Fan: "Fan",
  Umbrella: "Umbrella",
  Bow: "Bow",
};

function coerceKey(x: unknown): string {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    const anyX = x as any;
    // on tente les propriétés les plus fréquentes
    if (typeof anyX.key === "string") return anyX.key;
    if (typeof anyX.id === "string") return anyX.id;
    if (typeof anyX.name === "string") return anyX.name;
    if (typeof anyX.value === "string") return anyX.value;
    if (typeof anyX.type === "string") return anyX.type;
  }
  return "";
}

// EXPORT UNIQUE (pas de doublon)
export function statLabel(stat: unknown): string {
  const key = coerceKey(stat);
  if (!key) return "";
  return STAT_LABELS[key] ?? key;
}

export function slotLabel(slotName: string): string {
  if (!slotName) return slotName;
  return SLOT_LABELS[slotName] ?? slotName;
}

export function weaponLabel(weaponName: string): string {
  if (!weaponName) return weaponName;
  return WEAPON_LABELS[weaponName] ?? weaponName;
}