import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  GameState,
  InventoryItem,
  Quest,
  Enemy,
  Decision,
  Memory,
  NarrativeMessage,
  CombatState,
  CombatLogEntry,
  EquipmentSlot,
} from '../types';
import type { FGCharacter } from '../types/fabulasGoblins';
import { getCharacter } from '../services/supabase/characterService';
import {
  saveCampaignState,
  getMemories,
} from '../services/supabase/campaignService';
import { createCombatState } from '../game/combat/combatEngine';

// ─── Actions interface ────────────────────────────────────────

interface GameActions {
  initGame: (
    campaignPlayerId: string,
    characterId: string,
    campaignId: string,
  ) => Promise<void>;
  addNarrativeMessage: (message: NarrativeMessage) => void;
  updateCharacterHp: (hp: number) => void;
  updateCharacterMana: (mana: number) => void;
  updateCharacterGold: (gold: number) => void;
  addToInventory: (item: InventoryItem) => void;
  removeFromInventory: (inventoryItemId: string) => void;
  equipItem: (inventoryItemId: string, slot: EquipmentSlot) => void;
  unequipItem: (inventoryItemId: string) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  startCombat: (enemies: Enemy[]) => void;
  endCombat: (result: 'victory' | 'defeat' | 'fled') => void;
  addCombatLogEntry: (entry: CombatLogEntry) => void;
  addMemory: (memory: Memory) => void;
  addDecision: (decision: Decision) => void;
  saveGame: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  // F&G system
  setSelectedSystem: (system: 'fabulas-goblins' | 'dnd5e' | 'custom') => void;
  setFGCharacter: (character: FGCharacter) => void;
  // Internal
  _setCampaignPlayerId: (id: string) => void;
}

// ─── Persisted slice ──────────────────────────────────────────

interface PersistedSlice {
  campaignId: string | null;
  characterId: string | null;
  currentLocationId: string | null;
  selectedSystem: 'fabulas-goblins' | 'dnd5e' | 'custom' | null;
  fgCharacter: FGCharacter | null;
}

// ─── Full store type ──────────────────────────────────────────

type GameStore = GameState &
  GameActions & {
    campaignPlayerId: string | null;
    selectedSystem: 'fabulas-goblins' | 'dnd5e' | 'custom' | null;
    fgCharacter: FGCharacter | null;
  };

// ─── Initial state ────────────────────────────────────────────

const initialState: GameState & {
  campaignPlayerId: string | null;
  selectedSystem: 'fabulas-goblins' | 'dnd5e' | 'custom' | null;
  fgCharacter: FGCharacter | null;
} = {
  campaignId: null,
  characterId: null,
  currentLocationId: null,
  currentSceneId: null,
  character: null,
  inventory: [],
  quests: [],
  npcs: [],
  activeEnemies: [],
  decisions: [],
  memories: [],
  narrativeHistory: [],
  activeCombat: null,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  campaignPlayerId: null,
  selectedSystem: null,
  fgCharacter: null,
};

// ─── Store ────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      _setCampaignPlayerId: (id) => set({ campaignPlayerId: id }),

      initGame: async (campaignPlayerId, characterId, campaignId) => {
        set({ isLoading: true });

        try {
          // Load character
          const { data: character, error: charError } = await getCharacter(characterId);
          if (charError || !character) {
            console.error('Failed to load character:', charError);
            set({ isLoading: false });
            return;
          }

          // Load memories
          const { data: memories } = await getMemories(campaignPlayerId, 30);

          set({
            campaignPlayerId,
            campaignId,
            characterId,
            character,
            memories: memories ?? [],
            inventory: [],
            quests: [],
            npcs: [],
            activeEnemies: [],
            decisions: [],
            narrativeHistory: [],
            activeCombat: null,
            isLoading: false,
          });
        } catch (err) {
          console.error('initGame error:', err);
          set({ isLoading: false });
        }
      },

      addNarrativeMessage: (message) =>
        set((state) => ({
          narrativeHistory: [...state.narrativeHistory, message],
        })),

      updateCharacterHp: (hp) =>
        set((state) => {
          if (!state.character) return {};
          return { character: { ...state.character, currentHp: hp } };
        }),

      updateCharacterMana: (mana) =>
        set((state) => {
          if (!state.character) return {};
          return { character: { ...state.character, currentMana: mana } };
        }),

      updateCharacterGold: (gold) =>
        set((state) => {
          if (!state.character) return {};
          return { character: { ...state.character, gold } };
        }),

      addToInventory: (item) =>
        set((state) => ({ inventory: [...state.inventory, item] })),

      removeFromInventory: (inventoryItemId) =>
        set((state) => ({
          inventory: state.inventory.filter((i) => i.id !== inventoryItemId),
        })),

      equipItem: (inventoryItemId, slot) =>
        set((state) => ({
          inventory: state.inventory.map((i) => {
            // Unequip any item already in this slot
            if (i.equipped && i.slot === slot) {
              return { ...i, equipped: false, slot: undefined };
            }
            if (i.id === inventoryItemId) {
              return { ...i, equipped: true, slot };
            }
            return i;
          }),
        })),

      unequipItem: (inventoryItemId) =>
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === inventoryItemId ? { ...i, equipped: false, slot: undefined } : i,
          ),
        })),

      updateQuestProgress: (questId, progress) =>
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === questId
              ? {
                  ...q,
                  progress,
                  status:
                    progress >= q.maxProgress
                      ? ('completed' as Quest['status'])
                      : q.status,
                }
              : q,
          ),
        })),

      startCombat: (enemies) => {
        const combat: CombatState = createCombatState(enemies);
        set({ activeCombat: combat, activeEnemies: enemies });
      },

      endCombat: (_result) =>
        set((state) => ({
          activeCombat: state.activeCombat
            ? { ...state.activeCombat, isActive: false }
            : null,
          activeEnemies: [],
        })),

      addCombatLogEntry: (entry) =>
        set((state) => {
          if (!state.activeCombat) return {};
          return {
            activeCombat: {
              ...state.activeCombat,
              log: [...state.activeCombat.log, entry],
            },
          };
        }),

      addMemory: (memory) =>
        set((state) => ({ memories: [...state.memories, memory] })),

      addDecision: (decision) =>
        set((state) => ({ decisions: [...state.decisions, decision] })),

      saveGame: async () => {
        const state = get();
        if (!state.campaignPlayerId) return;

        set({ isSaving: true });
        try {
          await saveCampaignState(state.campaignPlayerId, {
            currentLocationId: state.currentLocationId,
            currentSceneId: state.currentSceneId,
            stateData: {
              narrativeHistoryLength: state.narrativeHistory.length,
              lastSaved: new Date().toISOString(),
            },
          });
          set({ lastSaved: new Date().toISOString(), isSaving: false });
        } catch (err) {
          console.error('saveGame error:', err);
          set({ isSaving: false });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setSelectedSystem: (system) => set({ selectedSystem: system }),

      setFGCharacter: (character) => set({ fgCharacter: character }),
    }),

    {
      name: 'rpg-game-state',
      storage: createJSONStorage(() => localStorage),
      // Only persist the minimal identifiers — all live data re-hydrates from Supabase
      partialize: (state): PersistedSlice => ({
        campaignId: state.campaignId,
        characterId: state.characterId,
        currentLocationId: state.currentLocationId,
        selectedSystem: state.selectedSystem,
        fgCharacter: state.fgCharacter,
      }),
    },
  ),
);
