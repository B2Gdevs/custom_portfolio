import { ConditionOperator, NodeType } from './constants';

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: Condition[];
  setFlags?: string[];
}

export interface Condition {
  flag: string;
  operator: ConditionOperator;
  value?: boolean | number | string; // Required for comparison operators
}

export interface DialogueNode {
  id: string;
  type: NodeType;
  speaker?: string;
  content: string;
  choices?: Choice[];
  nextNodeId?: string;
  setFlags?: string[];
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

