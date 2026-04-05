'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StateStorage } from 'zustand/middleware';
import type { DialogueTree } from '@magicborn/dialogue-forge/src/types';
import type { FlagSchema } from '@magicborn/dialogue-forge/src/types/flags';
import { exampleFlagSchema } from '@magicborn/dialogue-forge/src/types/flags';
import { DEFAULT_DIALOGUE_TREE } from '@/lib/dialogue-forge/dialogue-forge-defaults';

export const DIALOGUE_FORGE_STORE_NAME = 'portfolio-dialogue-forge';

const LEGACY_TREE_KEY = 'dialogue-forge-tree-v2';
const LEGACY_FLAG_KEY = 'dialogue-forge-flag-schema';

function noopStorage(): StateStorage {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

type DialogueForgeState = {
  dialogueTree: DialogueTree;
  flagSchema: FlagSchema;
  setDialogueTree: (next: DialogueTree | ((prev: DialogueTree) => DialogueTree)) => void;
  setFlagSchema: (next: FlagSchema | ((prev: FlagSchema) => FlagSchema)) => void;
};

export const useDialogueForgeStore = create<DialogueForgeState>()(
  persist(
    immer((set) => ({
      dialogueTree: DEFAULT_DIALOGUE_TREE,
      flagSchema: exampleFlagSchema,
      setDialogueTree: (next) =>
        set((draft) => {
          draft.dialogueTree =
            typeof next === 'function' ? next(draft.dialogueTree) : next;
        }),
      setFlagSchema: (next) =>
        set((draft) => {
          draft.flagSchema = typeof next === 'function' ? next(draft.flagSchema) : next;
        }),
    })),
    {
      name: DIALOGUE_FORGE_STORE_NAME,
      version: 0,
      partialize: (s) => ({ dialogueTree: s.dialogueTree, flagSchema: s.flagSchema }),
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return noopStorage();
        return {
          getItem: (name) => {
            let raw = localStorage.getItem(name);
            if (!raw) {
              try {
                const treeRaw = localStorage.getItem(LEGACY_TREE_KEY);
                const flagRaw = localStorage.getItem(LEGACY_FLAG_KEY);
                if (treeRaw || flagRaw) {
                  const dialogueTree = treeRaw
                    ? (JSON.parse(treeRaw) as DialogueTree)
                    : DEFAULT_DIALOGUE_TREE;
                  const flagSchema = flagRaw
                    ? (JSON.parse(flagRaw) as FlagSchema)
                    : exampleFlagSchema;
                  raw = JSON.stringify({
                    state: { dialogueTree, flagSchema },
                    version: 0,
                  });
                  localStorage.setItem(name, raw);
                  localStorage.removeItem(LEGACY_TREE_KEY);
                  localStorage.removeItem(LEGACY_FLAG_KEY);
                }
              } catch {
                /* ignore corrupt legacy */
              }
            }
            return raw;
          },
          setItem: (name, value) => localStorage.setItem(name, value),
          removeItem: (name) => localStorage.removeItem(name),
        };
      }),
    },
  ),
);
