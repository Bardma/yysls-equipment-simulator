import { create } from 'zustand';

import { Calculator } from '@/lib/calculator';
import { ClassConfig } from '@/lib/data/classConfig';
import { loadSimState, saveSimState, type SimLoadoutIds } from '@/lib/storage';
import type { EquipItem, EquippedItems } from '@/lib/types';

export type DengLevelKey = Parameters<typeof Calculator.calculateTotal>[8];

// Default level: cast “safe” (avoids TS break if the union differs)
const DEFAULT_LEVEL = ('100' as unknown) as DengLevelKey;

const levelStorageKey = (account: string) => `yysls_level_${account}`;

const loadLevel = (account: string | null): DengLevelKey => {
  if (typeof window === 'undefined' || !account) return DEFAULT_LEVEL;
  const raw = window.localStorage.getItem(levelStorageKey(account));
  return ((raw ?? '') as unknown as DengLevelKey) || DEFAULT_LEVEL;
};

const saveLevel = (account: string | null, level: DengLevelKey) => {
  if (typeof window === 'undefined' || !account) return;
  window.localStorage.setItem(levelStorageKey(account), String(level));
};

const emptyEquippedItems = (): EquippedItems => ({
  weapon1: null,
  weapon2: null,
  head: null,
  chest: null,
  ring: null,
  pendant: null,
  legs: null,
  hands: null,
});

export interface SimulationState {
  // NEW
  level: DengLevelKey;
  setLevel: (account: string | null, level: DengLevelKey) => void;

  currentClass: string;
  bowType: string;
  setType: string;
  xinfaLoadout: string[];
  earlySeasonBonus: boolean;
  loanDingyin: boolean;

  equippedItems: EquippedItems;
  allClassLoadouts: Record<string, SimLoadoutIds>;

  hydrateForAccount: (account: string | null, db: EquipItem[]) => void;
  setCurrentClass: (account: string | null, name: string, db: EquipItem[]) => void;
  setBowType: (account: string | null, value: string) => void;
  setSetType: (account: string | null, value: string) => void;
  setXinfaLoadout: (account: string | null, loadout: string[]) => void;
  setEarlySeasonBonus: (account: string | null, value: boolean) => void;
  setLoanDingyin: (account: string | null, value: boolean) => void;

  equipSlot: (account: string | null, slotKey: keyof EquippedItems, equip: EquipItem | null) => void;
  updateEquipsById: (equips: EquipItem[]) => void;

  syncCurrentLoadoutIds: (account: string | null) => void;
}

const defaultClass = ClassConfig.CLASSES[0] || '';

const getDefaultXinfa = (cls: string): string[] => {
  const rules = ClassConfig.XINFA_RULES[cls];
  return rules ? [...rules.default] : ['', '', '', ''];
};

const buildLoadoutIds = (
  equippedItems: EquippedItems,
  bowType: string,
  setType: string,
  xinfaLoadout: string[],
  earlySeasonBonus: boolean,
  loanDingyin: boolean
): SimLoadoutIds => ({
  weapon1: equippedItems.weapon1?.id ?? null,
  weapon2: equippedItems.weapon2?.id ?? null,
  head: equippedItems.head?.id ?? null,
  chest: equippedItems.chest?.id ?? null,
  ring: equippedItems.ring?.id ?? null,
  pendant: equippedItems.pendant?.id ?? null,
  legs: equippedItems.legs?.id ?? null,
  hands: equippedItems.hands?.id ?? null,
  bowType,
  setType,
  xinfa: [...xinfaLoadout],
  earlySeasonBonus,
  loanDingyin,
});

const applyLoadout = (loadout: SimLoadoutIds | undefined, db: EquipItem[]): EquippedItems => {
  const getItem = (id: number | string | null | undefined) =>
    id === undefined || id === null ? null : db.find((item) => item.id === id) || null;

  return {
    weapon1: getItem(loadout?.weapon1),
    weapon2: getItem(loadout?.weapon2),
    head: getItem(loadout?.head),
    chest: getItem(loadout?.chest),
    ring: getItem(loadout?.ring),
    pendant: getItem(loadout?.pendant),
    legs: getItem(loadout?.legs),
    hands: getItem(loadout?.hands),
  };
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // NEW
  level: DEFAULT_LEVEL,
  setLevel: (account, nextLevel) => {
    set({ level: nextLevel });
    saveLevel(account, nextLevel);
  },

  currentClass: defaultClass,
  bowType: 'precision',
  setType: ClassConfig.DEFAULT_SETS[defaultClass] || '',
  xinfaLoadout: getDefaultXinfa(defaultClass),
  earlySeasonBonus: false,
  loanDingyin: false,
  equippedItems: emptyEquippedItems(),
  allClassLoadouts: {},

  hydrateForAccount: (account, db) => {
    const saved = loadSimState(account);
    const currentClass = saved?.currentClass || defaultClass;
    const allClassLoadouts = saved?.loadouts || {};
    const loadout = allClassLoadouts[currentClass];

    const setType = loadout?.setType || ClassConfig.DEFAULT_SETS[currentClass] || '';
    const bowType = loadout?.bowType || 'precision';
    const xinfaLoadout = loadout?.xinfa || getDefaultXinfa(currentClass);
    const earlySeasonBonus = loadout?.earlySeasonBonus ?? false;
    const loanDingyin = loadout?.loanDingyin ?? false;

    const equippedItems = applyLoadout(loadout, db);

    set({
      level: loadLevel(account),
      currentClass,
      allClassLoadouts,
      setType,
      bowType,
      xinfaLoadout,
      earlySeasonBonus,
      loanDingyin,
      equippedItems,
    });
  },

  setCurrentClass: (account, name, db) => {
    const { allClassLoadouts } = get();
    const loadout = allClassLoadouts[name];

    const setType = loadout?.setType || ClassConfig.DEFAULT_SETS[name] || '';
    const bowType = loadout?.bowType || 'precision';
    const xinfaLoadout = loadout?.xinfa || getDefaultXinfa(name);
    const earlySeasonBonus = loadout?.earlySeasonBonus ?? false;
    const loanDingyin = loadout?.loanDingyin ?? false;

    const equippedItems = applyLoadout(loadout, db);

    set({
      currentClass: name,
      setType,
      bowType,
      xinfaLoadout,
      earlySeasonBonus,
      loanDingyin,
      equippedItems,
    });

    if (account) {
      saveSimState(account, { currentClass: name, loadouts: allClassLoadouts });
    }
  },

  setBowType: (account, value) => {
    set({ bowType: value });
    get().syncCurrentLoadoutIds(account);
  },

  setSetType: (account, value) => {
    set({ setType: value });
    get().syncCurrentLoadoutIds(account);
  },

  setXinfaLoadout: (account, loadout) => {
    set({ xinfaLoadout: [...loadout] });
    get().syncCurrentLoadoutIds(account);
  },

  setEarlySeasonBonus: (account, value) => {
    set({ earlySeasonBonus: value });
    get().syncCurrentLoadoutIds(account);
  },

  setLoanDingyin: (account, value) => {
    set({ loanDingyin: value });
    get().syncCurrentLoadoutIds(account);
  },

  equipSlot: (account, slotKey, equip) => {
    const next = { ...get().equippedItems, [slotKey]: equip };
    set({ equippedItems: next });
    get().syncCurrentLoadoutIds(account);
  },

  updateEquipsById: (equips) => {
    const updateMap = new Map(equips.map((item) => [item.id, item]));
    const updated = { ...get().equippedItems };

    (Object.keys(updated) as Array<keyof EquippedItems>).forEach((key) => {
      const current = updated[key];
      if (current && updateMap.has(current.id)) {
        updated[key] = updateMap.get(current.id) || current;
      }
    });

    set({ equippedItems: updated });
  },

  syncCurrentLoadoutIds: (account) => {
    if (!account) return;

    const {
      currentClass,
      allClassLoadouts,
      equippedItems,
      bowType,
      setType,
      xinfaLoadout,
      earlySeasonBonus,
      loanDingyin,
    } = get();

    const loadout = buildLoadoutIds(
      equippedItems,
      bowType,
      setType,
      xinfaLoadout,
      earlySeasonBonus,
      loanDingyin
    );

    const nextLoadouts = { ...allClassLoadouts, [currentClass]: loadout };
    set({ allClassLoadouts: nextLoadouts });

    saveSimState(account, { currentClass, loadouts: nextLoadouts });
  },
}));