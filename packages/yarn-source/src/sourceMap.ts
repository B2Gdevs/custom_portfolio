/**
 * Source Map for correlating Yarn source with DialogueTree
 * 
 * This enables:
 * - Editor highlighting during playback
 * - Error correlation from compiler
 * - Debugging VM execution
 */

import type { DialogueTree, DialogueNode } from '@magicborn/dialogue-forge';

export interface SourceMapEntry {
  lineId: string;
  nodeId: string;
  type: 'content' | 'choice' | 'block';
  index?: number;
  blockType?: 'if' | 'elseif' | 'else';
  yarnLine?: number; // Line number in generated Yarn source
}

export interface SourceMap {
  entries: Map<string, SourceMapEntry>;
  yarnToLineId: Map<number, string>; // yarn line -> lineId
  lineIdToYarn: Map<string, number>; // lineId -> yarn line
}

/**
 * Create a source map from a DialogueTree with line IDs
 */
export function createSourceMap(tree: DialogueTree): SourceMap {
  const entries = new Map<string, SourceMapEntry>();
  const yarnToLineId = new Map<number, string>();
  const lineIdToYarn = new Map<string, number>();
  
  for (const node of Object.values(tree.nodes)) {
    // NPC content
    if (node.type === 'npc' && node.metadata?.lineId) {
      entries.set(node.metadata.lineId, {
        lineId: node.metadata.lineId,
        nodeId: node.id,
        type: 'content',
      });
    }
    
    // Choices
    if (node.choices) {
      node.choices.forEach((choice, idx) => {
        if (choice.metadata?.lineId) {
          entries.set(choice.metadata.lineId, {
            lineId: choice.metadata.lineId,
            nodeId: node.id,
            type: 'choice',
            index: idx,
          });
        }
      });
    }
    
    // Conditional blocks
    if (node.conditionalBlocks) {
      node.conditionalBlocks.forEach((block, idx) => {
        if (block.metadata?.lineId) {
          entries.set(block.metadata.lineId, {
            lineId: block.metadata.lineId,
            nodeId: node.id,
            type: 'block',
            index: idx,
            blockType: block.type,
          });
        }
      });
    }
  }
  
  return {
    entries,
    yarnToLineId,
    lineIdToYarn,
  };
}

/**
 * Update source map with Yarn line numbers after export
 */
export function updateSourceMapWithYarnLines(
  sourceMap: SourceMap,
  yarnSource: string
): SourceMap {
  const lines = yarnSource.split('\n');
  
  lines.forEach((line, lineNum) => {
    // Look for #line: tags
    const lineIdMatch = line.match(/#line:(\S+)/);
    if (lineIdMatch) {
      const lineId = lineIdMatch[1];
      sourceMap.yarnToLineId.set(lineNum + 1, lineId);
      sourceMap.lineIdToYarn.set(lineId, lineNum + 1);
      
      // Update the entry with yarn line
      const entry = sourceMap.entries.get(lineId);
      if (entry) {
        entry.yarnLine = lineNum + 1;
      }
    }
  });
  
  return sourceMap;
}

