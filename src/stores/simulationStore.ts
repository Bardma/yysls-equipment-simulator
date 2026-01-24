import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SimulationConfig, SimulationSlot, XinfaLoadout } from "@/types";
import {
  CLASSES,
  DEFAULT_SETS,
  XINFA_LOCKED,
  XINFA_RULES,
} from "@/lib/classConfig";
import { GENERIC_XINFA } from "@/lib/commonData";

interface SimulationState {
  // 每个角色的配置，key 是 characterId
  configs: Record<string, SimulationConfig>;

  // Actions
  getConfig: (characterId: string) => SimulationConfig;
  setClassName: (characterId: string, className: string) => void;
  setSetName: (characterId: string, setName: string) => void;
  setXinfaSlot: (
    characterId: string,
    slotIndex: 1 | 2 | 3 | 4,
    xinfaName: string
  ) => void;
  setXinfaLoadout: (characterId: string, loadout: XinfaLoadout) => void;
  setEquippedId: (
    characterId: string,
    slot: SimulationSlot,
    equipmentId: string | undefined
  ) => void;
  setUseEarlySeason: (characterId: string, value: boolean) => void;
  setFreezeDingyin: (characterId: string, value: boolean) => void;
  setAssumeFullChengyin: (characterId: string, value: boolean) => void;
  clearSlot: (characterId: string, slot: SimulationSlot) => void;
  resetConfig: (characterId: string) => void;
  deleteConfig: (characterId: string) => void;
  importConfig: (characterId: string, config: SimulationConfig) => void;

  // 获取当前流派的推荐心法
  getRecommendedXinfa: (className: string) => {
    locked: string[];
    default: string[];
    extra: string[];
    generic: string[];
  };

  // 根据流派自动设置默认配置
  applyClassDefaults: (characterId: string, className: string) => void;
}

// 创建默认心法配置
function createDefaultXinfaLoadout(className: string): XinfaLoadout {
  const locked = XINFA_LOCKED[className] || [];
  const rules = XINFA_RULES[className];
  const defaultXinfa = rules?.default || [];
  const extra = rules?.extra || [];

  // 锁定的心法放在前面的槽位
  const slot1 = locked[0] || defaultXinfa[0] || "";
  const slot2 = locked[1] || defaultXinfa[1] || (locked.length < 2 ? defaultXinfa[0] : "");
  const slot3 = extra[0] || GENERIC_XINFA[0] || "";
  const slot4 = extra[1] || GENERIC_XINFA[1] || "";

  return { slot1, slot2, slot3, slot4 };
}

const defaultClassName = CLASSES[0] || "破竹尘";

const defaultConfig: SimulationConfig = {
  className: defaultClassName,
  xinfaLoadout: createDefaultXinfaLoadout(defaultClassName),
  setName: DEFAULT_SETS[defaultClassName] || "连星",
  equippedIds: {},
  useEarlySeason: false,
  freezeDingyin: false,
  assumeFullChengyin: false,
};

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      configs: {},

      getConfig: (characterId: string) => {
        const config = get().configs[characterId];
        if (config) {
          // 迁移旧数据格式
          if (!config.className && (config as any).xinfa) {
            return {
              ...defaultConfig,
              className: (config as any).xinfa,
              setName: (config as any).neiGong || defaultConfig.setName,
              xinfaLoadout: createDefaultXinfaLoadout(
                (config as any).xinfa || defaultClassName
              ),
              equippedIds: config.equippedIds || {},
              useEarlySeason: (config as any).useNextSeason || false,
              freezeDingyin: config.freezeDingyin || false,
              assumeFullChengyin: config.assumeFullChengyin || false,
            };
          }
          return config;
        }
        return { ...defaultConfig };
      },

      setClassName: (characterId: string, className: string) => {
        set((state) => {
          const currentConfig = state.configs[characterId] || defaultConfig;
          // 切换流派时自动更新默认套装和心法
          return {
            configs: {
              ...state.configs,
              [characterId]: {
                ...currentConfig,
                className,
                setName: DEFAULT_SETS[className] || currentConfig.setName,
                xinfaLoadout: createDefaultXinfaLoadout(className),
              },
            },
          };
        });
      },

      setSetName: (characterId: string, setName: string) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              setName,
            },
          },
        }));
      },

      setXinfaSlot: (
        characterId: string,
        slotIndex: 1 | 2 | 3 | 4,
        xinfaName: string
      ) => {
        set((state) => {
          const currentConfig = state.configs[characterId] || defaultConfig;
          const newLoadout = { ...currentConfig.xinfaLoadout };
          const slotKey = `slot${slotIndex}` as keyof XinfaLoadout;
          newLoadout[slotKey] = xinfaName;
          return {
            configs: {
              ...state.configs,
              [characterId]: {
                ...currentConfig,
                xinfaLoadout: newLoadout,
              },
            },
          };
        });
      },

      setXinfaLoadout: (characterId: string, loadout: XinfaLoadout) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              xinfaLoadout: loadout,
            },
          },
        }));
      },

      setEquippedId: (
        characterId: string,
        slot: SimulationSlot,
        equipmentId: string | undefined
      ) => {
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

      setUseEarlySeason: (characterId: string, value: boolean) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [characterId]: {
              ...(state.configs[characterId] || defaultConfig),
              useEarlySeason: value,
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

      getRecommendedXinfa: (className: string) => {
        const locked = XINFA_LOCKED[className] || [];
        const rules = XINFA_RULES[className] || { default: [], extra: [] };
        return {
          locked,
          default: rules.default,
          extra: rules.extra,
          generic: GENERIC_XINFA,
        };
      },

      applyClassDefaults: (characterId: string, className: string) => {
        set((state) => {
          const currentConfig = state.configs[characterId] || defaultConfig;
          return {
            configs: {
              ...state.configs,
              [characterId]: {
                ...currentConfig,
                className,
                setName: DEFAULT_SETS[className] || "连星",
                xinfaLoadout: createDefaultXinfaLoadout(className),
              },
            },
          };
        });
      },
    }),
    {
      name: "yysls-simulation",
    }
  )
);
