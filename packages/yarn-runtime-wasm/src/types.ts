/**
 * Core types for runtime implementations
 */

export type VariableValue = string | number | boolean;

export type RuntimeEventType = 
  | 'line'
  | 'options'
  | 'command'
  | 'node_start'
  | 'node_complete'
  | 'dialogue_complete'
  | 'prepare_for_lines';

export interface LineEvent {
  type: 'line';
  lineId: string;
  substitutions: string[];
}

export interface OptionInfo {
  id: number;
  lineId: string;
  enabled: boolean;
  destinationNode?: string;
}

export interface OptionsEvent {
  type: 'options';
  options: OptionInfo[];
}

export interface CommandEvent {
  type: 'command';
  text: string;
}

export interface NodeStartEvent {
  type: 'node_start';
  nodeName: string;
}

export interface NodeCompleteEvent {
  type: 'node_complete';
  nodeName: string;
}

export interface DialogueCompleteEvent {
  type: 'dialogue_complete';
}

export interface PrepareForLinesEvent {
  type: 'prepare_for_lines';
  lineIds: string[];
}

export type RuntimeEvent = 
  | LineEvent
  | OptionsEvent
  | CommandEvent
  | NodeStartEvent
  | NodeCompleteEvent
  | DialogueCompleteEvent
  | PrepareForLinesEvent;

/**
 * Interface for dialogue runtime implementations
 */
export interface DialogueRuntime {
  loadProgram(programBytes: ArrayBuffer): void;
  setNode(nodeName: string): void;
  continue(): RuntimeEvent | null;
  setSelectedOption(optionId: number): void;
  getVariable(name: string): VariableValue | undefined;
  setVariable(name: string, value: VariableValue): void;
  getVariableNames(): string[];
  isWaitingForOption(): boolean;
  isDialogueComplete(): boolean;
  reset(): void;
}

