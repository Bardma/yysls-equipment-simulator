import { create } from 'zustand';

import { Calculator } from '@/lib/calculator';
import { loadLevelsMap, saveLevelForAccount, saveLevelsMap } from '@/lib/storage';

/**
 * The exact level type expected by Calculator.calculateTotal (parameter index 8).
 * We force NonNullable so components can rely on a real value.
 */
export type DengLevelKey = NonNullable<Parameters<typeof Calculator.calculateTotal>[8]>;

interface LevelState {
  hydrated: boolean;
  levels: Record<string, DengLevelKey>;

  hydrateLevels: () => void;

  getLevel: (accountName: string | null) => DengLevelKey;
  setLevel: (accountName: string | null, level: DengLevelKey) => void;

  deleteLevel: (accountName: string | null) => void;
}

const DEFAULT_LEVEL = '100' as unknown as DengLevelKey;

const toLevelKey = (value: unknown): DengLevelKey => {
  // We store as string in localStorage; Calculator accepts whatever DengLevelKey is.
  // Keep it safe: if it’s empty/invalid, fallback.
  if (value === null || value === undefined) return DEFAULT_LEVEL;
  const s = String(value).trim();
  if (!s) return DEFAULT_LEVEL;
  return s as unknown as DengLevelKey;
};

export const useLevelStore = create<LevelState>((set, get) => ({
  hydrated: false,
  levels: {},

  hydrateLevels: () => {
    const map = loadLevelsMap(); // Record<string, string>
    const next: Record<string, DengLevelKey> = {};
    for (const k of Object.keys(map)) {
      next[k] = toLevelKey(map[k]);
    }
    set({ levels: next, hydrated: true });
  },

  getLevel: (accountName: string | null) => {
    if (!accountName) return DEFAULT_LEVEL;
    const { levels } = get();
    return levels[accountName] ?? DEFAULT_LEVEL;
  },

  setLevel: (accountName: string | null, level: DengLevelKey) => {
    if (!accountName) return;
    const lvl = toLevelKey(level);
    set((state) => ({
      levels: {
        ...state.levels,
        [accountName]: lvl,
      },
    }));
    // persist as string
    saveLevelForAccount(accountName, String(lvl));
  },

  deleteLevel: (accountName: string | null) => {
    if (!accountName) return;
    set((state) => {
      const next = { ...state.levels };
      delete next[accountName];
      return { levels: next };
    });
    // update persisted map
    const map = loadLevelsMap();
    delete map[accountName];
    saveLevelsMap(map);
  },
}));