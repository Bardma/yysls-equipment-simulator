import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/types';

interface CharacterState {
  characters: Character[];
  currentCharacterId: string | null;

  // Actions
  addCharacter: (name: string) => string;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (id: string | null) => void;
  getCurrentCharacter: () => Character | undefined;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      currentCharacterId: null,

      addCharacter: (name: string) => {
        const id = uuidv4();
        const newCharacter: Character = {
          id,
          name,
          createdAt: Date.now(),
        };
        set((state) => ({
          characters: [...state.characters, newCharacter],
          currentCharacterId: id,
        }));
        return id;
      },

      deleteCharacter: (id: string) => {
        set((state) => {
          const newCharacters = state.characters.filter((c) => c.id !== id);
          const newCurrentId = state.currentCharacterId === id
            ? (newCharacters.length > 0 ? newCharacters[0].id : null)
            : state.currentCharacterId;
          return {
            characters: newCharacters,
            currentCharacterId: newCurrentId,
          };
        });
      },

      setCurrentCharacter: (id: string | null) => {
        set({ currentCharacterId: id });
      },

      getCurrentCharacter: () => {
        const state = get();
        return state.characters.find((c) => c.id === state.currentCharacterId);
      },
    }),
    {
      name: 'yysls-characters',
    }
  )
);
