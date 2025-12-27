import { ConditionOperator, NodeType } from './constants';
export interface Choice {
    id: string;
    text: string;
    nextNodeId?: string;
    conditions?: Condition[];
    setFlags?: string[];
}
export interface Condition {
    flag: string;
    operator: ConditionOperator;
    value?: boolean | number | string;
}
/**
 * Conditional content block for if/elseif/else statements
 */
export interface ConditionalBlock {
    id: string;
    type: 'if' | 'elseif' | 'else';
    condition?: Condition[];
    content: string;
    speaker?: string;
    characterId?: string;
    nextNodeId?: string;
}
export interface DialogueNode {
    id: string;
    type: NodeType;
    speaker?: string;
    characterId?: string;
    content: string;
    choices?: Choice[];
    nextNodeId?: string;
    setFlags?: string[];
    conditionalBlocks?: ConditionalBlock[];
    x: number;
    y: number;
}
export interface DialogueTree {
    id: string;
    title: string;
    startNodeId: string;
    nodes: Record<string, DialogueNode>;
}
import { FlagSchema } from './flags';
export interface DialogueEditorProps {
    dialogue: DialogueTree | null;
    onChange: (dialogue: DialogueTree) => void;
    onExportYarn?: (yarn: string) => void;
    onExportJSON?: (json: string) => void;
    flagSchema?: FlagSchema;
    className?: string;
    showTitleEditor?: boolean;
    onNodeAdd?: (node: DialogueNode) => void;
    onNodeDelete?: (nodeId: string) => void;
    onNodeUpdate?: (nodeId: string, updates: Partial<DialogueNode>) => void;
    onConnect?: (sourceId: string, targetId: string, sourceHandle?: string) => void;
    onDisconnect?: (edgeId: string, sourceId: string, targetId: string) => void;
    onNodeSelect?: (nodeId: string | null) => void;
    onNodeDoubleClick?: (nodeId: string) => void;
}
export interface ContextMenu {
    x: number;
    y: number;
    graphX: number;
    graphY: number;
}
export interface EdgeDropMenu extends ContextMenu {
    fromNodeId: string;
    fromChoiceIdx?: number;
}
export interface DraggingEdge {
    fromNodeId: string;
    fromChoiceIdx?: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}
