import React from 'react';
import { DialogueTree, DialogueNode, Choice } from '../types';
import { FlagState, DialogueResult } from '../types/game-state';
import { type FlattenConfig } from '../utils/game-state-flattener';
export interface ScenePlayerProps {
    dialogue: DialogueTree;
    gameState: Record<string, any>;
    startNodeId?: string;
    onComplete: (result: DialogueResult) => void;
    onFlagUpdate?: (flags: FlagState) => void;
    flattenConfig?: FlattenConfig;
    onNodeEnter?: (nodeId: string, node: DialogueNode) => void;
    onNodeExit?: (nodeId: string, node: DialogueNode) => void;
    onChoiceSelect?: (nodeId: string, choice: Choice) => void;
    onDialogueStart?: () => void;
    onDialogueEnd?: () => void;
}
export declare function ScenePlayer({ dialogue, gameState, startNodeId, onComplete, onFlagUpdate, flattenConfig, onNodeEnter, onNodeExit, onChoiceSelect, onDialogueStart, onDialogueEnd, }: ScenePlayerProps): React.JSX.Element;
