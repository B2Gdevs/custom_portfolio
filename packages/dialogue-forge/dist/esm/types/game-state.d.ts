/**
 * Game State Integration Types
 *
 * These types define how Dialogue Forge integrates with your game's state system.
 */
import type { DialogueTree } from './index';
import type { FlagSchema } from './flags';
/**
 * Current game state - flags and their values
 */
export interface GameFlagState {
    [flagId: string]: boolean | number | string;
}
/**
 * Updated flags after dialogue completes
 */
export interface DialogueResult {
    updatedFlags: GameFlagState;
    dialogueTree: DialogueTree;
    completedNodeIds: string[];
}
/**
 * Props for running a dialogue (simulation/play mode)
 */
export interface DialogueRunProps {
    dialogue: DialogueTree;
    initialFlags: GameFlagState;
    startNodeId?: string;
    onComplete?: (result: DialogueResult) => void;
    onFlagUpdate?: (flags: GameFlagState) => void;
}
/**
 * Props for editing a dialogue
 */
export interface DialogueEditProps {
    dialogue: DialogueTree | null;
    flagSchema?: FlagSchema;
    initialFlags?: GameFlagState;
    onChange: (dialogue: DialogueTree) => void;
    onExportYarn?: (yarn: string) => void;
    onExportJSON?: (json: string) => void;
    className?: string;
    showTitleEditor?: boolean;
}
