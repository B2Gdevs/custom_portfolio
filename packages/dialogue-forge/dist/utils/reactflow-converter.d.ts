/**
 * React Flow Converter Utilities
 *
 * Converts between DialogueTree format and React Flow format.
 *
 * React Flow Format:
 * - nodes: Array of { id, type, position: {x, y}, data }
 * - edges: Array of { id, source, target, sourceHandle?, targetHandle?, type, data? }
 */
import { DialogueTree, DialogueNode } from '../types';
import { Node, Edge, Position } from 'reactflow';
import { LayoutDirection } from './layout';
export declare const CHOICE_COLORS: string[];
export interface ReactFlowNodeData {
    node: DialogueNode;
    flagSchema?: any;
    layoutDirection?: LayoutDirection;
}
export type ReactFlowNode = Node<ReactFlowNodeData>;
export type ReactFlowEdge = Edge;
/**
 * Get handle positions based on layout direction
 * For horizontal (LR): source on right, target on left
 * For vertical (TB): source on bottom, target on top
 */
export declare function getHandlePositions(direction: LayoutDirection): {
    sourcePosition: Position;
    targetPosition: Position;
};
/**
 * Convert DialogueTree to React Flow format
 */
export declare function convertDialogueTreeToReactFlow(dialogue: DialogueTree, layoutDirection?: LayoutDirection): {
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
};
/**
 * Convert React Flow format back to DialogueTree
 *
 * This updates node positions and edge connections in the DialogueTree.
 */
export declare function updateDialogueTreeFromReactFlow(dialogue: DialogueTree, nodes: Node[], edges: Edge[]): DialogueTree;
