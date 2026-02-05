import { create } from 'zustand';
import {
  DEFAULT_LEVEL,
  loadLevelMap,
  loadLevelForAccount,
  saveLevelForAccount,
  deleteLevelForAccount,
} from '@/lib/levelStorage';

type LevelMap = Record<string, string>;

interface LevelState {
  levels: LevelMap;
  hydrated: boolean;
  hydrateLevels: () => void;
  getLevel: (accountName: string | null) => string;
  setLevel: (accountName: string | null, level: string) => string;
  deleteLevel: (accountName: string | null) => void;
}

export const useLevelStore = create<LevelState>((set, get) => ({
  levels: {},
  hydrated: false,

  hydrateLevels: () => {
    const map = loadLevelMap();
    set({ levels: map, hydrated: true });
  },

  getLevel: (accountName) => {
    if (!accountName) return DEFAULT_LEVEL;

    const { levels } = get();
    const cached = levels[accountName];
    if (typeof cached === 'string' && cached.length > 0) return cached;

    const loaded = loadLevelForAccount(accountName);
    set({ levels: { ...levels, [accountName]: loaded } });
    return loaded;
  },

  setLevel: (accountName, level) => {
    if (!accountName) return DEFAULT_LEVEL;
    const saved = saveLevelForAccount(accountName, level);

    const { levels } = get();
    set({ levels: { ...levels, [accountName]: saved } });
    return saved;
  },

  deleteLevel: (accountName) => {
    if (!accountName) return;
    deleteLevelForAccount(accountName);

    const { levels } = get();
    const next = { ...levels };
    delete next[accountName];
    set({ levels: next });
  },
}));