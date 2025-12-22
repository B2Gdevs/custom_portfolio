import React from 'react';
import { DialogueTree } from '../types';
import { FlagSchema } from '../types/flags';
interface ExampleLoaderProps {
    onLoadDialogue: (dialogue: DialogueTree) => void;
    onLoadFlags: (flags: FlagSchema) => void;
    currentDialogue?: DialogueTree;
    currentFlags?: FlagSchema;
}
export declare function ExampleLoader({ onLoadDialogue, onLoadFlags }: ExampleLoaderProps): React.JSX.Element;
export {};
