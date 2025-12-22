import React from 'react';
import { DialogueTree } from '../types';
import { FlagSchema } from '../types/flags';
import { GameFlagState } from '../types/game-state';
interface PlayViewProps {
    dialogue: DialogueTree;
    startNodeId?: string;
    flagSchema?: FlagSchema;
    initialFlags?: GameFlagState;
}
export declare function PlayView({ dialogue, startNodeId, flagSchema, initialFlags }: PlayViewProps): React.JSX.Element;
export {};
