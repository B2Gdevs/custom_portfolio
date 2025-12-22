import { DialogueNode, DialogueTree, Choice } from '../types';
import { NodeType } from '../types/constants';
export declare function createNode(type: NodeType, id: string, x: number, y: number): DialogueNode;
export declare function addChoiceToNode(node: DialogueNode): DialogueNode;
export declare function removeChoiceFromNode(node: DialogueNode, choiceIdx: number): DialogueNode;
export declare function updateChoiceInNode(node: DialogueNode, choiceIdx: number, updates: Partial<Choice>): DialogueNode;
export declare function deleteNodeFromTree(tree: DialogueTree, nodeId: string): DialogueTree;
