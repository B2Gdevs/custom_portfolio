import React from 'react';
import { DialogueTree } from '../types';
import { GameFlagState, DialogueResult } from '../types/game-state';
interface DialogueSimulatorProps {
    dialogue: DialogueTree;
    initialFlags: GameFlagState;
    startNodeId?: string;
    onComplete: (result: DialogueResult) => void;
    onFlagUpdate?: (flags: GameFlagState) => void;
}
export declare function DialogueSimulator({ dialogue, initialFlags, startNodeId, onComplete, onFlagUpdate }: DialogueSimulatorProps): React.JSX.Element;
export {};
