/**
 * Dialogue Editor V2 - React Flow Implementation
 *
 * This is the new version using React Flow for graph rendering.
 * See V2_MIGRATION_PLAN.md for implementation details.
 */
import React from 'react';
import 'reactflow/dist/style.css';
import { DialogueEditorProps } from '../types';
import { FlagSchema } from '../types/flags';
type ViewMode = 'graph' | 'yarn' | 'play';
export declare function DialogueEditorV2(props: DialogueEditorProps & {
    flagSchema?: FlagSchema;
    initialViewMode?: ViewMode;
    layoutStrategy?: string;
}): React.JSX.Element;
export {};
