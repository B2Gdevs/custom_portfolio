/**
 * ExampleLoaderButton - Compact button for loading examples
 *
 * Debug tool for loading example dialogues and flag schemas.
 * Only shown when ENABLE_DEBUG_TOOLS is true.
 */
import React from 'react';
import { DialogueTree } from '../types';
import { FlagSchema } from '../types/flags';
interface ExampleLoaderButtonProps {
    onLoadDialogue: (dialogue: DialogueTree) => void;
    onLoadFlags: (flags: FlagSchema) => void;
}
export declare function ExampleLoaderButton({ onLoadDialogue, onLoadFlags }: ExampleLoaderButtonProps): React.JSX.Element;
export {};
