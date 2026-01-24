import { create } from 'zustand';

import { loadEquipData, saveEquipData } from '../lib/storage';
import type { EquipItem } from '../lib/types';

interface EquipmentState {
  db: EquipItem[];
  filter: string;
  hydrate: (items: EquipItem[]) => void;
  loadForAccount: (account: string | null) => void;
  setFilter: (filter: string) => void;
  addEquip: (account: string | null, equip: EquipItem) => void;
  updateEquip: (account: string | null, equip: EquipItem) => void;
  deleteEquip: (account: string | null, id: number | string) => void;
  replaceAll: (account: string | null, items: EquipItem[]) => void;
  getById: (id: number | string) => EquipItem | undefined;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  db: [],
  filter: 'all',
  hydrate: (items) => {
    set({ db: items, filter: 'all' });
  },
  loadForAccount: (account) => {
    set({ db: loadEquipData(account), filter: 'all' });
  },
  setFilter: (filter) => {
    set({ filter });
  },
  addEquip: (account, equip) => {
    const next = [...get().db, equip];
    saveEquipData(account, next);
    set({ db: next });
  },
  updateEquip: (account, equip) => {
    const next = get().db.map((item) => (item.id === equip.id ? equip : item));
    saveEquipData(account, next);
    set({ db: next });
  },
  deleteEquip: (account, id) => {
    const next = get().db.filter((item) => item.id !== id);
    saveEquipData(account, next);
    set({ db: next });
  },
  replaceAll: (account, items) => {
    saveEquipData(account, items);
    set({ db: items });
  },
  getById: (id) => get().db.find((item) => item.id === id),
}));
