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
  xinfa?: string[];
  earlySeasonBonus?: boolean;
  loanDingyin?: boolean;
  level?: number;
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
