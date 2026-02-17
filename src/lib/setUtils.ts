export const parseSetTypes = (setType: string): string[] =>
  String(setType || '')
    .split('+')
    .map((name) => name.trim())
    .filter(Boolean);

export const combineSetTypes = (armorSetType: string, weaponSetType: string): string =>
  [armorSetType, weaponSetType].filter(Boolean).join('+');

export const hasSetType = (setType: string, targetSet: string): boolean =>
  parseSetTypes(setType).includes(targetSet);
