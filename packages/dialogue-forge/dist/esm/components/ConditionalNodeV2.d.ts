import React from 'react';
import { NodeProps } from 'reactflow';
import { DialogueNode } from '../types';
import { FlagSchema } from '../types/flags';
import { LayoutDirection } from '../utils/layout';
interface ConditionalNodeData {
    node: DialogueNode;
    flagSchema?: FlagSchema;
    isDimmed?: boolean;
    isInPath?: boolean;
    layoutDirection?: LayoutDirection;
    isStartNode?: boolean;
    isEndNode?: boolean;
}
export declare function ConditionalNodeV2({ data, selected }: NodeProps<ConditionalNodeData>): React.JSX.Element;
export {};
