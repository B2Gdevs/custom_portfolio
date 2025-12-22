import { DialogueTree, DialogueNode } from '../types';

const NODE_WIDTH = 250;
const NODE_HEIGHT = 150;
const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 200;

interface LayoutNode {
  id: string;
  level: number;
  position: number; // Position within level
  children: LayoutNode[];
}

/**
 * Calculate hierarchical layout for dialogue nodes
 * Uses breadth-first traversal to arrange nodes in levels
 */
export function calculateHierarchicalLayout(dialogue: DialogueTree): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const visited = new Set<string>();
  const levelMap = new Map<number, string[]>(); // level -> node IDs
  const nodeLevels = new Map<string, number>(); // node ID -> level
  
  // Start from the start node
  const startNodeId = dialogue.startNodeId;
  if (!startNodeId || !dialogue.nodes[startNodeId]) {
    return positions;
  }
  
  // BFS to assign levels
  const queue: { id: string; level: number }[] = [{ id: startNodeId, level: 0 }];
  visited.add(startNodeId);
  nodeLevels.set(startNodeId, 0);
  
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    
    if (!levelMap.has(level)) {
      levelMap.set(level, []);
    }
    levelMap.get(level)!.push(id);
    
    const node = dialogue.nodes[id];
    if (!node) continue;
    
    // Get all children (next nodes)
    const children: string[] = [];
    
    // NPC/conditional nodes: nextNodeId
    if (node.nextNodeId && !visited.has(node.nextNodeId)) {
      children.push(node.nextNodeId);
    }
    
    // Conditional blocks: nextNodeId from each block
    if (node.conditionalBlocks) {
      node.conditionalBlocks.forEach(block => {
        if (block.nextNodeId && !visited.has(block.nextNodeId)) {
          children.push(block.nextNodeId);
        }
      });
    }
    
    // Player nodes: nextNodeId from each choice
    if (node.choices) {
      node.choices.forEach(choice => {
        if (choice.nextNodeId && !visited.has(choice.nextNodeId)) {
          children.push(choice.nextNodeId);
        }
      });
    }
    
    // Add children to queue
    children.forEach(childId => {
      if (!visited.has(childId)) {
        visited.add(childId);
        nodeLevels.set(childId, level + 1);
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }
  
  // Calculate positions for each level
  const levels = Array.from(levelMap.keys()).sort((a, b) => a - b);
  
  levels.forEach(level => {
    const nodeIds = levelMap.get(level)!;
    const levelWidth = nodeIds.length * HORIZONTAL_SPACING;
    const startX = -levelWidth / 2 + HORIZONTAL_SPACING / 2;
    
    nodeIds.forEach((nodeId, idx) => {
      positions[nodeId] = {
        x: startX + idx * HORIZONTAL_SPACING,
        y: level * VERTICAL_SPACING
      };
    });
  });
  
  // Handle unvisited nodes (orphans) - place them to the right
  let maxX = 0;
  if (levels.length > 0) {
    const lastLevel = levelMap.get(levels[levels.length - 1])!;
    maxX = lastLevel.length * HORIZONTAL_SPACING;
  }
  
  Object.keys(dialogue.nodes).forEach(nodeId => {
    if (!visited.has(nodeId)) {
      positions[nodeId] = {
        x: maxX + HORIZONTAL_SPACING,
        y: 0
      };
      maxX += HORIZONTAL_SPACING;
    }
  });
  
  return positions;
}

/**
 * Apply hierarchical layout to dialogue tree
 */
export function applyHierarchicalLayout(dialogue: DialogueTree): DialogueTree {
  const positions = calculateHierarchicalLayout(dialogue);
  
  const updatedNodes: Record<string, DialogueNode> = {};
  Object.keys(dialogue.nodes).forEach(nodeId => {
    const node = dialogue.nodes[nodeId];
    const position = positions[nodeId] || { x: node.x, y: node.y };
    updatedNodes[nodeId] = {
      ...node,
      x: position.x,
      y: position.y
    };
  });
  
  return {
    ...dialogue,
    nodes: updatedNodes
  };
}


