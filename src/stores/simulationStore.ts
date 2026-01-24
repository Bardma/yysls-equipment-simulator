import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimulationConfig, SimulationSlot } from '@/types';

interface SimulationState {
  // 每个角色的配置，key 是 characterId
  configs: Record<string, SimulationConfig>;

  // Actions
  getConfig: (characterId: string) => SimulationConfig;
  setXinfa: (characterId: string, xinfa: string) => void;
  setGongJue: (characterId: string, gongJue: string) => void;
  setNeiGong: (characterId: string, neiGong: string) => void;
  setEquippedId: (characterId: string, slot: SimulationSlot, equipmentId: string | undefined) => void;
  setUseNextSeason: (characterId: string, value: boolean) => void;
  setFreezeDingyin: (characterId: string, value: boolean) => void;
  setAssumeFullChengyin: (characterId: string, value: boolean) => void;
  clearSlot: (characterId: string, slot: SimulationSlot) => void;
  resetConfig: (characterId: string) => void;
  deleteConfig: (characterId: string) => void;
  importConfig: (characterId: string, config: SimulationConfig) => void;
}

const defaultConfig: SimulationConfig = {
  xinfa: '鸣金虹',
  gongJue: '精准弓',
  neiGong: '玉斗',
  equippedIds: {},
  useNextSeason: false,
  freezeDingyin: false,
  assumeFullChengyin: false,
};

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      configs: {},

      getConfig: (characterId: string) => {
        return get().configs[characterId] || { ...defaultConfig };
      },

      setXinfa: (characterId: string, xinfa: string) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              xinfa,
            },
          },
        }));
      },

      setGongJue: (characterId: string, gongJue: string) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              gongJue,
            },
          },
        }));
      },

      setNeiGong: (characterId: string, neiGong: string) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              neiGong,
            },
          },
        }));
      },

      setEquippedId: (characterId: string, slot: SimulationSlot, equipmentId: string | undefined) => {
        set((state) => {
          const currentConfig = state.configs[characterId] || defaultConfig;
          const newEquippedIds = { ...currentConfig.equippedIds };
          if (equipmentId) {
            newEquippedIds[slot] = equipmentId;
          } else {
            delete newEquippedIds[slot];
          }
          return {
            configs: {
              ...state.configs,
              [characterId]: {
                ...currentConfig,
                equippedIds: newEquippedIds,
              },
            },
          };
        });
      },

      setUseNextSeason: (characterId: string, value: boolean) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              useNextSeason: value,
            },
          },
        }));
      },

      setFreezeDingyin: (characterId: string, value: boolean) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              freezeDingyin: value,
            },
          },
        }));
      },

      setAssumeFullChengyin: (characterId: string, value: boolean) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              assumeFullChengyin: value,
            },
          },
        }));
      },

      clearSlot: (characterId: string, slot: SimulationSlot) => {
        set((state) => {
          const currentConfig = state.configs[characterId] || defaultConfig;
          const newEquippedIds = { ...currentConfig.equippedIds };
          delete newEquippedIds[slot];
          return {
            configs: {
              ...state.configs,
              [characterId]: {
                ...currentConfig,
                equippedIds: newEquippedIds,
              },
            },
          };
        });
      },

      resetConfig: (characterId: string) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: { ...defaultConfig },
          },
        }));
      },

      deleteConfig: (characterId: string) => {
        set((state) => {
          const newConfigs = { ...state.configs };
          delete newConfigs[characterId];
          return { configs: newConfigs };
        });
      },

      importConfig: (characterId: string, config: SimulationConfig) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: config,
          },
        }));
      },
    }),
    {
      name: 'yysls-simulation',
    }
  )
);
