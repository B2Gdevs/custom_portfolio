/**
 * Dialogue Editor V2 - React Flow Implementation
 *
 * This is the new version using React Flow for graph rendering.
 * See V2_MIGRATION_PLAN.md for implementation details.
 */
import React from 'react';
import 'reactflow/dist/style.css';
import { DialogueEditorProps, ViewMode } from '../types';
import { FlagSchema } from '../types/flags';
import { Character } from '../types/characters';
export declare function DialogueEditorV2(props: DialogueEditorProps & {
    flagSchema?: FlagSchema;
    characters?: Record<string, Character>;
    initialViewMode?: ViewMode;
    viewMode?: ViewMode;
    onViewModeChange?: (mode: ViewMode) => void;
    layoutStrategy?: string;
    onLayoutStrategyChange?: (strategy: string) => void;
    onOpenFlagManager?: () => void;
    onOpenGuide?: () => void;
}): React.JSX.Element;
