/**
 * Ensure stable line IDs for all dialogue content
 * 
 * Line IDs are critical for:
 * - Localization (string tables)
 * - Compiled program correlation
 * - Debugging and source mapping
 */

import type { DialogueTree, DialogueNode, Choice, ConditionalBlock } from '@magicborn/dialogue-forge';

export interface LineIdOptions {
  /** Prefix for generated line IDs (default: 'line') */
  prefix?: string;
  /** Use content hash for stability (default: true) */
  useContentHash?: boolean;
  /** Separator character (default: '_') */
  separator?: string;
}

export interface LineIdResult {
  tree: DialogueTree;
  lineIdMap: Map<string, string>; // lineId -> content
  totalLines: number;
}

/**
 * Generate a deterministic line ID from content
 */
export function generateLineId(
  nodeId: string,
  context: string,
  index?: number,
  options: LineIdOptions = {}
): string {
  const { prefix = 'line', separator = '_' } = options;
  
  const parts = [prefix, nodeId, context];
  if (index !== undefined) {
    parts.push(String(index));
  }
  
  return parts.join(separator);
}

/**
 * Generate a simple hash for content-based stability
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 6);
}

/**
 * Ensure all dialogue content has stable line IDs
 * 
 * This mutates the tree in place and returns the line ID map.
 */
export function ensureLineIds(
  tree: DialogueTree,
  options: LineIdOptions = {}
): LineIdResult {
  const { useContentHash = true } = options;
  const lineIdMap = new Map<string, string>();
  let totalLines = 0;
  
  // Deep clone to avoid mutating original
  const resultTree: DialogueTree = JSON.parse(JSON.stringify(tree));
  
  for (const node of Object.values(resultTree.nodes)) {
    // NPC node content
    if (node.type === 'npc' && node.content) {
      const lineId = generateLineId(node.id, 'content', undefined, options);
      if (!node.metadata) node.metadata = {};
      node.metadata.lineId = lineId;
      lineIdMap.set(lineId, node.content);
      totalLines++;
    }
    
    // Player choices
    if (node.choices) {
      node.choices.forEach((choice, idx) => {
        const lineId = generateLineId(node.id, 'choice', idx, options);
        if (!choice.metadata) choice.metadata = {};
        choice.metadata.lineId = lineId;
        lineIdMap.set(lineId, choice.text);
        totalLines++;
      });
    }
    
    // Conditional blocks
    if (node.conditionalBlocks) {
      node.conditionalBlocks.forEach((block, idx) => {
        if (block.content) {
          const lineId = generateLineId(node.id, `block_${block.type}`, idx, options);
          if (!block.metadata) block.metadata = {};
          block.metadata.lineId = lineId;
          lineIdMap.set(lineId, block.content);
          totalLines++;
        }
      });
    }
  }
  
  return {
    tree: resultTree,
    lineIdMap,
    totalLines,
  };
}

