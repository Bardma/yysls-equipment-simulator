import type { EquipItem } from './types';

const ACCOUNTS_KEY = 'game_account_list';
const LAST_ACCOUNT_KEY = 'last_selected_account';
const UI_PANEL_KEY = 'ui_right_panels';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const hasWindow = () => typeof window !== 'undefined';

export const storageKeys = {
  accounts: ACCOUNTS_KEY,
  lastAccount: LAST_ACCOUNT_KEY,
  equipKey: (account: string) => `game_equip_data_${account}`,
  simKey: (account: string) => `game_sim_data_${account}`,
  uiPanelKey: (account: string) => `${UI_PANEL_KEY}_${account}`,
};

export const loadAccounts = (): string[] => {
  if (!hasWindow()) return [];
  return safeParse<string[]>(localStorage.getItem(ACCOUNTS_KEY), []);
};

export const saveAccounts = (accounts: string[]): void => {
  if (!hasWindow()) return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const loadLastSelectedAccount = (): string | null => {
  if (!hasWindow()) return null;
  return localStorage.getItem(LAST_ACCOUNT_KEY);
};

export const saveLastSelectedAccount = (account: string | null): void => {
  if (!hasWindow()) return;
  if (!account) {
    localStorage.removeItem(LAST_ACCOUNT_KEY);
    return;
  }
  localStorage.setItem(LAST_ACCOUNT_KEY, account);
};

export const loadEquipData = (account: string | null): EquipItem[] => {
  if (!hasWindow() || !account) return [];
  return safeParse<EquipItem[]>(localStorage.getItem(storageKeys.equipKey(account)), []);
};

export const saveEquipData = (account: string | null, data: EquipItem[]): void => {
  if (!hasWindow() || !account) return;
  localStorage.setItem(storageKeys.equipKey(account), JSON.stringify(data));
};

export interface SimLoadoutIds {
  level?: import('./levelBaseStats').DengLevelKey;
  weapon1: number | string | null;
  weapon2: number | string | null;
  head: number | string | null;
  chest: number | string | null;
  ring: number | string | null;
  pendant: number | string | null;
  legs: number | string | null;
  hands: number | string | null;
  bowType?: string;
  setType?: string;
  armorSetType?: string;
  xinfa?: string[];
  earlySeasonBonus?: boolean;
  loanDingyin?: boolean;
}

export interface SimStorageState {
  currentClass: string;
  loadouts: Record<string, SimLoadoutIds>;
}

export interface RightPanelState {
  simulation: boolean;
  graduation: boolean;
  stats: boolean;
}

const defaultRightPanelState: RightPanelState = {
  simulation: true,
  graduation: true,
  stats: true,
};

export const loadRightPanelState = (account: string | null): RightPanelState => {
  if (!hasWindow() || !account) return defaultRightPanelState;
  return safeParse<RightPanelState>(
    localStorage.getItem(storageKeys.uiPanelKey(account)),
    defaultRightPanelState
  );
};

export const saveRightPanelState = (account: string | null, data: RightPanelState): void => {
  if (!hasWindow() || !account) return;
  localStorage.setItem(storageKeys.uiPanelKey(account), JSON.stringify(data));
};

export const loadSimState = (account: string | null): SimStorageState | null => {
  if (!hasWindow() || !account) return null;
  return safeParse<SimStorageState | null>(localStorage.getItem(storageKeys.simKey(account)), null);
};

export const saveSimState = (account: string | null, data: SimStorageState): void => {
  if (!hasWindow() || !account) return;
  localStorage.setItem(storageKeys.simKey(account), JSON.stringify(data));
};

export const clearAccountData = (account: string | null): void => {
  if (!hasWindow() || !account) return;
  localStorage.removeItem(storageKeys.equipKey(account));
  localStorage.removeItem(storageKeys.simKey(account));
  localStorage.removeItem(storageKeys.uiPanelKey(account));
};
// ===== Level storage (per-account) =====

const LEVELS_KEY = 'yysls.levels.v1';

type LevelsMap = Record<string, string>;

/**
 * Internal: load the whole map { [accountName]: levelKey }
 */
export const loadLevelsMap = (): LevelsMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LEVELS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as LevelsMap;
  } catch {
    return {};
  }
};

/**
 * Internal: save the whole map
 */
export const saveLevelsMap = (map: LevelsMap) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEVELS_KEY, JSON.stringify(map));
  } catch {
    // ignore write failures
  }
};

/**
 * Public: load one account level (string key)
 */
export const loadLevelForAccount = (accountName: string | null): string | null => {
  if (!accountName) return null;
  const map = loadLevelsMap();
  const v = map[accountName];
  return typeof v === 'string' ? v : null;
};

/**
 * Public: save one account level (string key)
 */
export const saveLevelForAccount = (accountName: string | null, level: string) => {
  if (!accountName) return;
  const map = loadLevelsMap();
  map[accountName] = level;
  saveLevelsMap(map);
};

/**
 * Optional: delete account level when deleting account data
 */
export const deleteLevelForAccount = (accountName: string | null) => {
  if (!accountName) return;
  const map = loadLevelsMap();
  if (map[accountName] !== undefined) {
    delete map[accountName];
    saveLevelsMap(map);
  }
};