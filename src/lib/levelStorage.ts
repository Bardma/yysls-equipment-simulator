const KEY = 'yysls_level_by_account_v1';

type LevelMap = Record<string, string>;

// Mets ici la valeur valide par défaut selon ton union
export const DEFAULT_LEVEL = '100';

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

export function loadLevelForAccount(accountName: string): string {
  const map = loadLevelMap();
  const v = map[accountName];
  return typeof v === 'string' && v.length > 0 ? v : DEFAULT_LEVEL;
}

export function saveLevelForAccount(accountName: string, level: string): string {
  if (typeof window === 'undefined') return level;
  const map = loadLevelMap();
  map[accountName] = level;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  return level;
}

export function deleteLevelForAccount(accountName: string): void {
  if (typeof window === 'undefined') return;
  const map = loadLevelMap();
  if (accountName in map) {
    delete map[accountName];
    window.localStorage.setItem(KEY, JSON.stringify(map));
  }
}
