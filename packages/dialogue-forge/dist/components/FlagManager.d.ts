import React from 'react';
import { FlagSchema } from '../types/flags';
import { DialogueTree } from '../types';
interface FlagManagerProps {
    flagSchema: FlagSchema;
    dialogue?: DialogueTree;
    onUpdate: (schema: FlagSchema) => void;
    onClose: () => void;
}
export declare function FlagManager({ flagSchema, dialogue, onUpdate, onClose }: FlagManagerProps): React.JSX.Element;
export {};
