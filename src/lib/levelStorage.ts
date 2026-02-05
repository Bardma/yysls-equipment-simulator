// src/lib/levelStorage.ts

const KEY = 'yysls_level_by_account_v1';

type LevelMap = Record<string, number>;

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

const clampInt = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(v)));

export const DEFAULT_LEVEL = 100;
// Ajuste si tu veux borner
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;

export function loadLevelMap(): LevelMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as LevelMap;
  } catch {
    return {};
  }
}

export function saveLevelMap(map: LevelMap): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function loadLevelForAccount(accountName: string): number {
  const map = loadLevelMap();
  const v = map[accountName];
  if (!isFiniteNumber(v)) return DEFAULT_LEVEL;
  return clampInt(v, MIN_LEVEL, MAX_LEVEL);
}

export function saveLevelForAccount(accountName: string, level: number): number {
  const nextLevel = clampInt(level, MIN_LEVEL, MAX_LEVEL);
  const map = loadLevelMap();
  map[accountName] = nextLevel;
  saveLevelMap(map);
  return nextLevel;
}

export function deleteLevelForAccount(accountName: string): void {
  const map = loadLevelMap();
  if (accountName in map) {
    delete map[accountName];
    saveLevelMap(map);
  }
}
