import React from 'react';
import { DialogueTree, DialogueNode, Choice } from '../types';
import { GameFlagState, DialogueResult } from '../types/game-state';
export interface ScenePlayerProps {
    dialogue: DialogueTree;
    gameState?: Record<string, any>;
    initialFlags?: GameFlagState;
    startNodeId?: string;
    onComplete: (result: DialogueResult) => void;
    onFlagUpdate?: (flags: GameFlagState) => void;
    onNodeEnter?: (nodeId: string, node: DialogueNode) => void;
    onNodeExit?: (nodeId: string, node: DialogueNode) => void;
    onChoiceSelect?: (nodeId: string, choice: Choice) => void;
    onDialogueStart?: () => void;
    onDialogueEnd?: () => void;
}
export declare function ScenePlayer({ dialogue, gameState, initialFlags, startNodeId, onComplete, onFlagUpdate, onNodeEnter, onNodeExit, onChoiceSelect, onDialogueStart, onDialogueEnd, }: ScenePlayerProps): React.JSX.Element;
