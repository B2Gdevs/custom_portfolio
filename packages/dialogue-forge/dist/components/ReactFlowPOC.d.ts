/**
 * Proof of Concept: React Flow Implementation with Custom Choice Edges
 *
 * This demonstrates how we can use React Flow's custom edges feature
 * to implement our choice-based edge system.
 *
 * Key concepts:
 * 1. Dynamic handles on PlayerNode (one handle per choice)
 * 2. Custom ChoiceEdge component that colors based on choice index
 * 3. Edge data stores choiceIndex and choiceId
 *
 * To use this, install: npm install reactflow
 */
import React from 'react';
import { DialogueTree } from '../types';
/**
 * Custom Edge Component for Player Choice Connections
 *
 * This edge:
 * - Colors based on choice index (from edge data)
 * - Uses bezier path for smooth curves
 * - Matches our current visual style
 */
/**
 * NPC Node Component
 *
 * Features:
 * - Single output handle at bottom
 * - Speaker + content display
 * - Matches current styling
 */
/**
 * Player Node Component
 *
 * Features:
 * - Dynamic handles: one per choice (positioned on right side)
 * - Each handle positioned at choice's Y offset
 * - Matches current styling
 */
/**
 * Convert DialogueTree to React Flow format
 */
export declare function convertDialogueTreeToReactFlow(dialogue: DialogueTree): {
    nodes: any[];
    edges: any[];
    nodeTypes: {};
    edgeTypes: {};
};
/**
 * Main React Flow Component (POC)
 *
 * Usage:
 * ```tsx
 * <ReactFlowProvider>
 *   <ReactFlowPOC dialogue={dialogueTree} />
 * </ReactFlowProvider>
 * ```
 */
export declare function ReactFlowPOC({ dialogue }: {
    dialogue: DialogueTree;
}): React.JSX.Element;
