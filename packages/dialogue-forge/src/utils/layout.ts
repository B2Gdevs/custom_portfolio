/**
 * Layout Utilities for Dialogue Forge
 * 
 * Provides algorithms for automatic graph layout:
 * - Dagre-based hierarchical layout (start → end flow)
 * - Collision resolution for freeform editing
 */

import dagre from '@dagrejs/dagre';
import { DialogueTree, DialogueNode } from '../types';

// ============================================================================
// Constants
// ============================================================================

export type LayoutDirection = 'TB' | 'LR'; // Top-Bottom or Left-Right

const NODE_WIDTH = 220;
const NODE_HEIGHT = 120;
const EXTRA_HEIGHT_PER_ITEM = 30; // Extra height per choice/block

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate the depth (distance from start) of each node using BFS.
 * Used to order nodes for better dagre layout results.
 */
function calculateNodeDepths(dialogue: DialogueTree): Map<string, number> {
  const depths = new Map<string, number>();
  if (!dialogue.startNodeId) return depths;
  
  const queue: Array<{ id: string; depth: number }> = [
    { id: dialogue.startNodeId, depth: 0 }
  ];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    depths.set(id, depth);
    
    const node = dialogue.nodes[id];
    if (!node) continue;
    
    // Queue all connected nodes
    const connectedIds = getOutgoingNodeIds(node);
    for (const nextId of connectedIds) {
      if (dialogue.nodes[nextId] && !visited.has(nextId)) {
        queue.push({ id: nextId, depth: depth + 1 });
      }
    }
  }
  
  return depths;
}

/**
 * Get all outgoing node IDs from a dialogue node.
 */
function getOutgoingNodeIds(node: DialogueNode): string[] {
  const ids: string[] = [];
  
  if (node.nextNodeId) {
    ids.push(node.nextNodeId);
  }
  
  node.choices?.forEach(choice => {
    if (choice.nextNodeId) ids.push(choice.nextNodeId);
  });
  
  node.conditionalBlocks?.forEach(block => {
    if (block.nextNodeId) ids.push(block.nextNodeId);
  });
  
  return ids;
}

/**
 * Estimate node height based on content (choices/blocks add height).
 */
function estimateNodeHeight(node: DialogueNode): number {
  const choiceCount = node.choices?.length || 0;
  const blockCount = node.conditionalBlocks?.length || 0;
  const extraItems = Math.max(choiceCount, blockCount);
  return NODE_HEIGHT + extraItems * EXTRA_HEIGHT_PER_ITEM;
}

// ============================================================================
// Main Layout Functions
// ============================================================================

/**
 * Apply dagre layout algorithm to dialogue tree.
 * 
 * Arranges nodes in a hierarchical flow from start to end:
 * - TB (Top-Bottom): Start at top, ends at bottom
 * - LR (Left-Right): Start at left, ends at right
 * 
 * @see https://reactflow.dev/examples/layout/dagre
 */
export function applyDagreLayout(
  dialogue: DialogueTree, 
  direction: LayoutDirection = 'TB'
): DialogueTree {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  const nodeDepths = calculateNodeDepths(dialogue);
  
  // Configure dagre
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: isHorizontal ? 60 : 80,   // Spacing perpendicular to flow
    ranksep: isHorizontal ? 180 : 120, // Spacing along flow direction
    marginx: 50,
    marginy: 50,
    ranker: 'network-simplex', // Best for ensuring proper flow direction
    align: 'UL',
    acyclicer: 'greedy',       // Handle cycles gracefully
    edgesep: 15,
  });

  // Add nodes ordered by depth (helps dagre produce better results)
  const sortedNodeIds = Object.keys(dialogue.nodes).sort((a, b) => {
    return (nodeDepths.get(a) ?? Infinity) - (nodeDepths.get(b) ?? Infinity);
  });
  
  for (const nodeId of sortedNodeIds) {
    const node = dialogue.nodes[nodeId];
    dagreGraph.setNode(nodeId, { 
      width: NODE_WIDTH, 
      height: estimateNodeHeight(node),
    });
  }

  // Add edges with weights (higher weight = straighter path)
  for (const node of Object.values(dialogue.nodes)) {
    // Main flow (nextNodeId) gets highest weight
    if (node.nextNodeId && dialogue.nodes[node.nextNodeId]) {
      dagreGraph.setEdge(node.id, node.nextNodeId, { weight: 3, minlen: 1 });
    }
    
    // Branches (choices/blocks) get lower weight
    for (const choice of node.choices || []) {
      if (choice.nextNodeId && dialogue.nodes[choice.nextNodeId]) {
        dagreGraph.setEdge(node.id, choice.nextNodeId, { weight: 2, minlen: 1 });
      }
    }
    for (const block of node.conditionalBlocks || []) {
      if (block.nextNodeId && dialogue.nodes[block.nextNodeId]) {
        dagreGraph.setEdge(node.id, block.nextNodeId, { weight: 2, minlen: 1 });
      }
    }
  }

  // Run layout algorithm
  dagre.layout(dagreGraph);

  // Extract positions (dagre gives center, convert to top-left for React Flow)
  const positions: Record<string, { x: number; y: number }> = {};
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  for (const nodeId of Object.keys(dialogue.nodes)) {
    const dagreNode = dagreGraph.node(nodeId);
    if (dagreNode) {
      const x = dagreNode.x - NODE_WIDTH / 2;
      const y = dagreNode.y - NODE_HEIGHT / 2;
      positions[nodeId] = { x, y };
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + NODE_WIDTH);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + NODE_HEIGHT);
    }
  }

  // Ensure start node is at the edge
  const startNodeId = dialogue.startNodeId;
  if (startNodeId && positions[startNodeId]) {
    const startPos = positions[startNodeId];
    const threshold = 50;
    
    if (isHorizontal && startPos.x - minX > threshold) {
      positions[startNodeId].x = minX;
    } else if (!isHorizontal && startPos.y - minY > threshold) {
      positions[startNodeId].y = minY;
    }
  }

  // Build updated nodes with new positions
  const updatedNodes: Record<string, DialogueNode> = {};
  for (const nodeId of Object.keys(dialogue.nodes)) {
    const node = dialogue.nodes[nodeId];
    const pos = positions[nodeId];
    
    updatedNodes[nodeId] = {
      ...node,
      x: pos?.x ?? (isHorizontal ? maxX + 100 : node.x),
      y: pos?.y ?? (isHorizontal ? node.y : maxY + 100),
    };
  }

  return { ...dialogue, nodes: updatedNodes };
}

/**
 * Resolve node collisions for freeform layout.
 * Iteratively pushes overlapping nodes apart until no collisions remain.
 * 
 * @see https://reactflow.dev/examples/layout/node-collisions
 */
export function resolveNodeCollisions(
  dialogue: DialogueTree,
  options: { maxIterations?: number; overlapThreshold?: number; margin?: number } = {}
): DialogueTree {
  const { maxIterations = 50, overlapThreshold = 0.3, margin = 20 } = options;

  // Create mutable position array
  const nodePositions = Object.values(dialogue.nodes).map(node => ({
    id: node.id,
    x: node.x,
    y: node.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }));

  // Iteratively resolve collisions
  for (let iter = 0; iter < maxIterations; iter++) {
    let hasCollision = false;

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const a = nodePositions[i];
        const b = nodePositions[j];

        // Calculate overlap
        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

        if (overlapX > 0 && overlapY > 0) {
          const overlapRatio = (overlapX * overlapY) / Math.min(a.width * a.height, b.width * b.height);
          
          if (overlapRatio > overlapThreshold) {
            hasCollision = true;
            
            // Calculate push direction
            const dx = (b.x + b.width / 2) - (a.x + a.width / 2);
            const dy = (b.y + b.height / 2) - (a.y + a.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Push apart
            const pushX = (dx / dist) * (overlapX / 2 + margin);
            const pushY = (dy / dist) * (overlapY / 2 + margin);
            
            a.x -= pushX / 2;
            a.y -= pushY / 2;
            b.x += pushX / 2;
            b.y += pushY / 2;
          }
        }
      }
    }

    if (!hasCollision) break;
  }

  // Build updated dialogue
  const updatedNodes: Record<string, DialogueNode> = {};
  for (const pos of nodePositions) {
    updatedNodes[pos.id] = { ...dialogue.nodes[pos.id], x: pos.x, y: pos.y };
  }

  return { ...dialogue, nodes: updatedNodes };
}

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

/** @deprecated Use applyDagreLayout instead */
export const applyHierarchicalLayout = applyDagreLayout;

/** @deprecated Use applyDagreLayout instead */
export function calculateHierarchicalLayout(
  dialogue: DialogueTree, 
  direction: LayoutDirection = 'TB'
): Record<string, { x: number; y: number }> {
  const layouted = applyDagreLayout(dialogue, direction);
  const positions: Record<string, { x: number; y: number }> = {};
  for (const node of Object.values(layouted.nodes)) {
    positions[node.id] = { x: node.x, y: node.y };
  }
  return positions;
}
