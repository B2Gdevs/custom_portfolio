import { DialogueNode, Choice } from '../../types';
import { VariableManager } from './variable-manager';
export interface ProcessedNodeResult {
    content: string;
    speaker?: string;
    nextNodeId?: string;
    isEnd: boolean;
    isPlayerChoice: boolean;
    choices?: Choice[];
}
/**
 * Processes a dialogue node and returns the result
 */
export declare function processNode(node: DialogueNode, variableManager: VariableManager): ProcessedNodeResult;
/**
 * Validates that a nextNodeId exists and is valid
 */
export declare function isValidNextNode(nextNodeId: string | undefined, availableNodes: Record<string, DialogueNode>): boolean;
