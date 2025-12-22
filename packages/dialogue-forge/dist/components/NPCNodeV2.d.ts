/**
 * NPCNodeV2 - React Flow node component for NPC dialogue
 *
 * Displays:
 * - Node header with ID and type
 * - Speaker name (if present)
 * - Content preview (truncated)
 * - Flag indicators
 * - Start/End badges when applicable
 */
import React from 'react';
import { NodeProps } from 'reactflow';
import { DialogueNode } from '../types';
import { FlagSchema } from '../types/flags';
import { LayoutDirection } from '../utils/layout';
interface NPCNodeData {
    node: DialogueNode;
    flagSchema?: FlagSchema;
    isDimmed?: boolean;
    isInPath?: boolean;
    layoutDirection?: LayoutDirection;
    isStartNode?: boolean;
    isEndNode?: boolean;
}
export declare function NPCNodeV2({ data, selected }: NodeProps<NPCNodeData>): React.JSX.Element;
export {};
