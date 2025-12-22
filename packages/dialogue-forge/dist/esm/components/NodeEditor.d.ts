import React from 'react';
import { DialogueNode, DialogueTree, Choice } from '../types';
import { FlagSchema } from '../types/flags';
interface NodeEditorProps {
    node: DialogueNode;
    dialogue: DialogueTree;
    onUpdate: (updates: Partial<DialogueNode>) => void;
    onDelete: () => void;
    onAddChoice: () => void;
    onUpdateChoice: (idx: number, updates: Partial<Choice>) => void;
    onRemoveChoice: (idx: number) => void;
    onClose: () => void;
    onPlayFromHere?: (nodeId: string) => void;
    onFocusNode?: (nodeId: string) => void;
    flagSchema?: FlagSchema;
}
export declare function NodeEditor({ node, dialogue, onUpdate, onDelete, onAddChoice, onUpdateChoice, onRemoveChoice, onClose, onPlayFromHere, onFocusNode, flagSchema }: NodeEditorProps): React.JSX.Element;
export {};
