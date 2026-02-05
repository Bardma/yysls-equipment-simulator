import { create } from 'zustand';
import { Calculator } from '@/lib/calculator';

// Le type EXACT attendu par Calculator.calculateTotal en 9e argument
export type DengLevelKey = Parameters<typeof Calculator.calculateTotal>[8];

type LevelMap = Record<string, DengLevelKey>;

const STORAGE_KEY = 'yysls_levels_v1';

// Défaut sûr (compile quoi qu’il arrive)
const DEFAULT_LEVEL = '100' as unknown as DengLevelKey;

// LocalStorage safe (SSR/Next)
function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readAll(): LevelMap {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LevelMap;
  } catch {
    return {};
  }
}

function writeAll(map: LevelMap) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // noop
  }
}

interface LevelState {
  hydrated: boolean;
  levels: LevelMap;

  hydrateLevels: () => void;

  // Retourne toujours un DengLevelKey (jamais undefined)
  getLevel: (accountName: string | null) => DengLevelKey;

  // Set level pour un compte (si account null => noop)
  setLevel: (accountName: string | null, level: DengLevelKey) => void;

  // Optionnel: reset
  resetLevel: (accountName: string | null) => void;
}

export const useLevelStore = create<LevelState>((set, get) => ({
  hydrated: false,
  levels: {},

  hydrateLevels: () => {
    const data = readAll();
    set({ levels: data, hydrated: true });
  },

  getLevel: (accountName) => {
    if (!accountName) return DEFAULT_LEVEL;
    const { levels } = get();
    return (levels[accountName] ?? DEFAULT_LEVEL) as DengLevelKey;
  },

  setLevel: (accountName, level) => {
    if (!accountName) return;
    const next = { ...get().levels, [accountName]: level } as LevelMap;
    set({ levels: next });
    writeAll(next);
  },

  resetLevel: (accountName) => {
    if (!accountName) return;
    const next = { ...get().levels };
    delete next[accountName];
    set({ levels: next });
    writeAll(next);
  },
}));