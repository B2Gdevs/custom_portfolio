'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { exportToYarn } from '@magicborn/dialogue-forge/src/lib/yarn-converter';
import type { DialogueTree } from '@magicborn/dialogue-forge/src/types';
import type { FlagSchema } from '@magicborn/dialogue-forge/src/types/flags';
import { useDialogueForgeStore } from '@/lib/stores/dialogue-forge-store';

const MAX_HISTORY = 50;

function cloneTree(state: DialogueTree): DialogueTree {
  return JSON.parse(JSON.stringify(state)) as DialogueTree;
}

export type DialogueForgeViewMode = 'graph' | 'play' | 'yarn';

export function useDialogueForgePageState() {
  const dialogueTree = useDialogueForgeStore((s) => s.dialogueTree);
  const setDialogueTreeStore = useDialogueForgeStore((s) => s.setDialogueTree);
  const flagSchema = useDialogueForgeStore((s) => s.flagSchema);
  const setFlagSchema = useDialogueForgeStore((s) => s.setFlagSchema);

  const [viewMode, setViewMode] = useState<DialogueForgeViewMode>('graph');
  const [showFlagManager, setShowFlagManager] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [layoutStrategy, setLayoutStrategy] = useState('dagre');
  const [hasChanges, setHasChanges] = useState(false);

  const [history, setHistory] = useState<DialogueTree[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const resetHistory = useCallback((newState: DialogueTree) => {
    setHistory([cloneTree(newState)]);
    setHistoryIndex(0);
    isUndoRedoRef.current = false;
  }, []);

  const saveSnapshot = useCallback(
    (state: DialogueTree) => {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false;
        return;
      }
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const snapshot = cloneTree(state);
        const next = [...trimmed, snapshot];
        if (next.length > MAX_HISTORY) {
          const limited = next.slice(-MAX_HISTORY);
          setHistoryIndex(MAX_HISTORY - 1);
          return limited;
        }
        setHistoryIndex(next.length - 1);
        return next;
      });
    },
    [historyIndex],
  );

  const updateDialogueTree = useCallback(
    (updater: (prev: DialogueTree) => DialogueTree) => {
      const prev = useDialogueForgeStore.getState().dialogueTree;
      saveSnapshot(prev);
      setDialogueTreeStore(updater(prev));
      setHasChanges(true);
    },
    [saveSnapshot, setDialogueTreeStore],
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0 || historyIndex <= 0) return;
    isUndoRedoRef.current = true;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setDialogueTreeStore(cloneTree(history[newIndex]));
    setHasChanges(true);
  }, [history, historyIndex, setDialogueTreeStore]);

  const handleRedo = useCallback(() => {
    if (history.length === 0 || historyIndex >= history.length - 1) return;
    isUndoRedoRef.current = true;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setDialogueTreeStore(cloneTree(history[newIndex]));
    setHasChanges(true);
  }, [history, historyIndex, setDialogueTreeStore]);

  useEffect(() => {
    const unsub = useDialogueForgeStore.persist.onFinishHydration(() => {
      resetHistory(useDialogueForgeStore.getState().dialogueTree);
    });
    queueMicrotask(() => {
      if (useDialogueForgeStore.persist.hasHydrated()) {
        resetHistory(useDialogueForgeStore.getState().dialogueTree);
      }
    });
    return unsub;
  }, [resetHistory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, [contenteditable="true"]')) return;

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo]);

  const handleExportYarn = useCallback(() => {
    const yarn = exportToYarn(dialogueTree);
    const blob = new Blob([yarn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dialogueTree.title.replace(/\s+/g, '_')}.yarn`;
    a.click();
    URL.revokeObjectURL(url);
  }, [dialogueTree]);

  const loadExampleDialogue = useCallback(
    (dialogue: DialogueTree) => {
      resetHistory(dialogue);
      setDialogueTreeStore(dialogue);
      setHasChanges(true);
    },
    [resetHistory, setDialogueTreeStore],
  );

  const loadExampleFlags = useCallback((flags: FlagSchema) => {
    setFlagSchema(flags);
    setHasChanges(true);
  }, [setFlagSchema]);

  return {
    dialogueTree,
    flagSchema,
    setFlagSchema,
    viewMode,
    setViewMode,
    showFlagManager,
    setShowFlagManager,
    showGuide,
    setShowGuide,
    layoutStrategy,
    setLayoutStrategy,
    hasChanges,
    setHasChanges,
    updateDialogueTree,
    handleExportYarn,
    loadExampleDialogue,
    loadExampleFlags,
  };
}
