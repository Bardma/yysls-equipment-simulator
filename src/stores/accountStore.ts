import { create } from "zustand";
import {
  loadAccounts,
  loadLastSelectedAccount,
  saveAccounts,
  saveLastSelectedAccount,
} from "../lib/storage";

interface AccountState {
  accounts: string[];
  currentAccount: string | null;
  hydrated: boolean;
  hydrate: () => void;
  createAccount: (name: string) => boolean;
  deleteAccount: (name: string) => void;
  setCurrentAccount: (name: string | null) => void;
}

const normalizeName = (name: string) => name.trim();

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  currentAccount: null,
  hydrated: false,
  hydrate: () => {
    const accounts = loadAccounts();
    const last = loadLastSelectedAccount();
    const currentAccount =
      last && accounts.includes(last) ? last : accounts[0] || null;
    set({ accounts, currentAccount, hydrated: true });
  },
  createAccount: (name: string) => {
    const cleaned = normalizeName(name);
    if (!cleaned) return false;
    const { accounts } = get();
    if (accounts.includes(cleaned)) return false;
    const next = [...accounts, cleaned];
    saveAccounts(next);
    saveLastSelectedAccount(cleaned);
    set({ accounts: next, currentAccount: cleaned });
    return true;
  },
  deleteAccount: (name: string) => {
    const { accounts, currentAccount } = get();
    const next = accounts.filter((item) => item !== name);
    saveAccounts(next);
    const nextCurrent = currentAccount === name ? next[0] || null : currentAccount;
    saveLastSelectedAccount(nextCurrent);
    set({ accounts: next, currentAccount: nextCurrent });
  },
  setCurrentAccount: (name: string | null) => {
    saveLastSelectedAccount(name);
    set({ currentAccount: name });
  },
}));
