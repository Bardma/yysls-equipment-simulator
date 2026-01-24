import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Equipment, EquipmentSlot, Affix } from '@/types';

interface EquipmentState {
  equipments: Equipment[];

  // Actions
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt'>) => string;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipmentsByCharacter: (characterId: string) => Equipment[];
  getEquipmentsBySlot: (characterId: string, slot: EquipmentSlot) => Equipment[];
  getEquipmentById: (id: string) => Equipment | undefined;
  deleteEquipmentsByCharacter: (characterId: string) => void;
  importEquipments: (characterId: string, equipments: Equipment[]) => void;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipments: [],

      addEquipment: (equipmentData) => {
        const id = uuidv4();
        const newEquipment: Equipment = {
          ...equipmentData,
          id,
          createdAt: Date.now(),
        };
        set((state) => ({
          equipments: [...state.equipments, newEquipment],
        }));
        return id;
      },

      updateEquipment: (id: string, updates: Partial<Equipment>) => {
        set((state) => ({
          equipments: state.equipments.map((eq) =>
            eq.id === id ? { ...eq, ...updates } : eq
          ),
        }));
      },

      deleteEquipment: (id: string) => {
        set((state) => ({
          equipments: state.equipments.filter((eq) => eq.id !== id),
        }));
      },

      getEquipmentsByCharacter: (characterId: string) => {
        return get().equipments.filter((eq) => eq.characterId === characterId);
      },

      getEquipmentsBySlot: (characterId: string, slot: EquipmentSlot) => {
        return get().equipments.filter(
          (eq) => eq.characterId === characterId && eq.slot === slot
        );
      },

      getEquipmentById: (id: string) => {
        return get().equipments.find((eq) => eq.id === id);
      },

      deleteEquipmentsByCharacter: (characterId: string) => {
        set((state) => ({
          equipments: state.equipments.filter((eq) => eq.characterId !== characterId),
        }));
      },

      importEquipments: (characterId: string, equipments: Equipment[]) => {
        set((state) => {
          // 删除该角色的所有装备，然后导入新的
          const otherEquipments = state.equipments.filter(
            (eq) => eq.characterId !== characterId
          );
          const importedEquipments = equipments.map((eq) => ({
            ...eq,
            characterId,
            id: uuidv4(), // 生成新的ID避免冲突
          }));
          return {
            equipments: [...otherEquipments, ...importedEquipments],
          };
        });
      },
    }),
    {
      name: 'yysls-equipments',
    }
  )
);
