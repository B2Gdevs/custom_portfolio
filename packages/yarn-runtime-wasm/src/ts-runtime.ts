/**
 * TypeScript-based Yarn Spinner runtime
 * 
 * This runtime interprets DialogueTree directly, providing
 * a pure TypeScript implementation without WASM dependencies.
 * 
 * Features:
 * - Full condition evaluation
 * - Variable operations (set, arithmetic)
 * - Choices with conditions
 * - Conditional blocks (if/elseif/else)
 * - Commands
 * - Navigation (jump)
 */

import type { 
  DialogueRuntime, 
  RuntimeEvent, 
  LineEvent, 
  OptionsEvent,
  CommandEvent,
  NodeStartEvent,
  NodeCompleteEvent,
  OptionInfo,
} from './types';
import { InMemoryVariableStorage, type VariableStorage, type VariableValue } from './variable-storage';

// Simplified dialogue types (matching dialogue-forge structure)
interface DialogueNode {
  id: string;
  type: 'npc' | 'player' | 'conditional';
  speaker?: string;
  content: string;
  choices?: Choice[];
  nextNodeId?: string;
  setFlags?: string[];
  conditionalBlocks?: ConditionalBlock[];
  metadata?: Record<string, any>;
}

interface Choice {
  id: string;
  text: string;
  nextNodeId?: string;
  setFlags?: string[];
  conditions?: Condition[];
  metadata?: Record<string, any>;
}

interface ConditionalBlock {
  id: string;
  type: 'if' | 'elseif' | 'else';
  condition?: Condition[];
  content: string;
  speaker?: string;
  nextNodeId?: string;
  metadata?: Record<string, any>;
}

interface Condition {
  flag: string;
  operator: 'is_set' | 'is_not_set' | 'equals' | 'not_equals' | 
            'greater_than' | 'less_than' | 'greater_equal' | 'less_equal';
  value?: any;
}

interface DialogueTree {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export interface TypeScriptRuntimeOptions {
  /** Initial dialogue tree (can be set later via loadDialogueTree) */
  dialogueTree?: DialogueTree;
  /** Initial variables */
  variables?: Record<string, VariableValue>;
  /** Variable storage implementation */
  variableStorage?: VariableStorage;
}

type RuntimeState = 
  | { status: 'idle' }
  | { status: 'running'; currentNodeId: string; phase: 'entering' | 'content' | 'choices' | 'exiting' }
  | { status: 'waiting_for_option'; currentNodeId: string; options: OptionInfo[] }
  | { status: 'complete' };

/**
 * TypeScript-based Yarn Spinner runtime
 */
export class TypeScriptRuntime implements DialogueRuntime {
  private dialogueTree: DialogueTree | null = null;
  private variables: VariableStorage;
  private state: RuntimeState = { status: 'idle' };
  private pendingEvents: RuntimeEvent[] = [];
  private lineIdCounter = 0;
  
  constructor(options: TypeScriptRuntimeOptions = {}) {
    this.variables = options.variableStorage || new InMemoryVariableStorage(options.variables);
    if (options.dialogueTree) {
      this.dialogueTree = options.dialogueTree;
    }
  }
  
  /**
   * Load a dialogue tree directly (TypeScript runtime only)
   */
  loadDialogueTree(tree: DialogueTree): void {
    this.dialogueTree = tree;
    this.reset();
  }
  
  /**
   * Load a compiled program (not supported in TypeScript runtime)
   */
  loadProgram(_programBytes: ArrayBuffer): void {
    throw new Error(
      'TypeScriptRuntime does not support compiled programs. ' +
      'Use loadDialogueTree() instead, or use WasmRuntime for .yarnc support.'
    );
  }
  
  /**
   * Set the starting node
   */
  setNode(nodeName: string): void {
    if (!this.dialogueTree) {
      throw new Error('No dialogue tree loaded');
    }
    
    if (!this.dialogueTree.nodes[nodeName]) {
      throw new Error(`Node not found: ${nodeName}`);
    }
    
    this.state = { 
      status: 'running', 
      currentNodeId: nodeName, 
      phase: 'entering' 
    };
    
    // Queue node start event
    this.pendingEvents.push({
      type: 'node_start',
      nodeName,
    });
  }
  
  /**
   * Continue execution until next pause point
   */
  continue(): RuntimeEvent | null {
    // Return pending events first
    if (this.pendingEvents.length > 0) {
      return this.pendingEvents.shift()!;
    }
    
    if (this.state.status === 'idle') {
      return null;
    }
    
    if (this.state.status === 'complete') {
      return null;
    }
    
    if (this.state.status === 'waiting_for_option') {
      // Still waiting, return options again
      return { type: 'options', options: this.state.options };
    }
    
    // Process current node
    return this.processCurrentNode();
  }
  
  /**
   * Select an option
   */
  setSelectedOption(optionId: number): void {
    if (this.state.status !== 'waiting_for_option') {
      throw new Error('Not waiting for option selection');
    }
    
    const option = this.state.options.find(o => o.id === optionId);
    if (!option) {
      throw new Error(`Invalid option ID: ${optionId}`);
    }
    
    // Get the node and choice
    const node = this.dialogueTree!.nodes[this.state.currentNodeId];
    const choice = node.choices?.find(c => c.id === option.lineId.replace('choice:', ''));
    
    // Apply choice set flags
    if (choice?.setFlags) {
      for (const flag of choice.setFlags) {
        this.variables.set(flag, true);
      }
    }
    
    // Queue node complete event
    this.pendingEvents.push({
      type: 'node_complete',
      nodeName: this.state.currentNodeId,
    });
    
    // Navigate to next node
    if (option.destinationNode) {
      this.state = { 
        status: 'running', 
        currentNodeId: option.destinationNode, 
        phase: 'entering' 
      };
      this.pendingEvents.push({
        type: 'node_start',
        nodeName: option.destinationNode,
      });
    } else {
      // No destination = dialogue complete
      this.state = { status: 'complete' };
      this.pendingEvents.push({ type: 'dialogue_complete' });
    }
  }
  
  getVariable(name: string): VariableValue | undefined {
    return this.variables.get(name);
  }
  
  setVariable(name: string, value: VariableValue): void {
    this.variables.set(name, value);
  }
  
  getVariableNames(): string[] {
    return this.variables.getAllNames();
  }
  
  isWaitingForOption(): boolean {
    return this.state.status === 'waiting_for_option';
  }
  
  isDialogueComplete(): boolean {
    return this.state.status === 'complete';
  }
  
  reset(): void {
    this.state = { status: 'idle' };
    this.pendingEvents = [];
    this.lineIdCounter = 0;
  }
  
  // Private methods
  
  private processCurrentNode(): RuntimeEvent | null {
    if (this.state.status !== 'running') {
      return null;
    }
    
    const node = this.dialogueTree!.nodes[this.state.currentNodeId];
    if (!node) {
      this.state = { status: 'complete' };
      return { type: 'dialogue_complete' };
    }
    
    switch (this.state.phase) {
      case 'entering':
        return this.processEntering(node);
      case 'content':
        return this.processContent(node);
      case 'choices':
        return this.processChoices(node);
      case 'exiting':
        return this.processExiting(node);
      default:
        return null;
    }
  }
  
  private processEntering(node: DialogueNode): RuntimeEvent | null {
    // Apply set flags
    if (node.setFlags) {
      for (const flag of node.setFlags) {
        this.variables.set(flag, true);
      }
    }
    
    // Process commands in content
    this.processCommands(node.content);
    
    this.state = { 
      status: 'running', 
      currentNodeId: node.id, 
      phase: 'content' 
    };
    
    return this.processContent(node);
  }
  
  private processContent(node: DialogueNode): RuntimeEvent | null {
    if (node.type === 'conditional' && node.conditionalBlocks) {
      // Find matching block
      const block = this.findMatchingBlock(node.conditionalBlocks);
      if (block && block.content) {
        const lineId = block.metadata?.lineId || `line:${node.id}:${block.id}`;
        
        // Move to exiting phase (will handle navigation)
        this.state = { 
          status: 'running', 
          currentNodeId: node.id, 
          phase: 'exiting' 
        };
        
        // Store the selected block's nextNodeId for navigation
        (this.state as any).selectedNextNodeId = block.nextNodeId;
        
        return {
          type: 'line',
          lineId,
          substitutions: [],
        };
      }
      
      // No matching block with content, move to exit
      this.state = { 
        status: 'running', 
        currentNodeId: node.id, 
        phase: 'exiting' 
      };
      return this.processExiting(node);
    }
    
    if (node.type === 'player') {
      // Move to choices phase
      this.state = { 
        status: 'running', 
        currentNodeId: node.id, 
        phase: 'choices' 
      };
      return this.processChoices(node);
    }
    
    // NPC node with content
    if (node.content) {
      const lineId = node.metadata?.lineId || `line:${node.id}`;
      
      this.state = { 
        status: 'running', 
        currentNodeId: node.id, 
        phase: 'exiting' 
      };
      
      return {
        type: 'line',
        lineId,
        substitutions: [],
      };
    }
    
    // No content, move to exit
    this.state = { 
      status: 'running', 
      currentNodeId: node.id, 
      phase: 'exiting' 
    };
    return this.processExiting(node);
  }
  
  private processChoices(node: DialogueNode): RuntimeEvent | null {
    if (!node.choices || node.choices.length === 0) {
      // No choices, move to exit
      this.state = { 
        status: 'running', 
        currentNodeId: node.id, 
        phase: 'exiting' 
      };
      return this.processExiting(node);
    }
    
    // Filter available choices
    const availableChoices = node.choices.filter(choice => 
      this.evaluateConditions(choice.conditions)
    );
    
    if (availableChoices.length === 0) {
      // No available choices, move to exit
      this.state = { 
        status: 'running', 
        currentNodeId: node.id, 
        phase: 'exiting' 
      };
      return this.processExiting(node);
    }
    
    // Build options
    const options: OptionInfo[] = availableChoices.map((choice, idx) => ({
      id: idx,
      lineId: choice.metadata?.lineId || `choice:${choice.id}`,
      enabled: true,
      destinationNode: choice.nextNodeId,
    }));
    
    this.state = {
      status: 'waiting_for_option',
      currentNodeId: node.id,
      options,
    };
    
    return { type: 'options', options };
  }
  
  private processExiting(node: DialogueNode): RuntimeEvent | null {
    // Queue node complete
    this.pendingEvents.push({
      type: 'node_complete',
      nodeName: node.id,
    });
    
    // Determine next node
    let nextNodeId = node.nextNodeId;
    
    // Check if we have a selected next from conditional block
    if ((this.state as any).selectedNextNodeId) {
      nextNodeId = (this.state as any).selectedNextNodeId;
    }
    
    if (nextNodeId && this.dialogueTree!.nodes[nextNodeId]) {
      this.state = { 
        status: 'running', 
        currentNodeId: nextNodeId, 
        phase: 'entering' 
      };
      this.pendingEvents.push({
        type: 'node_start',
        nodeName: nextNodeId,
      });
      return this.pendingEvents.shift()!;
    }
    
    // No next node = complete
    this.state = { status: 'complete' };
    this.pendingEvents.push({ type: 'dialogue_complete' });
    return this.pendingEvents.shift()!;
  }
  
  private findMatchingBlock(blocks: ConditionalBlock[]): ConditionalBlock | null {
    for (const block of blocks) {
      if (block.type === 'else') {
        return block; // Else always matches
      }
      
      if (this.evaluateConditions(block.condition)) {
        return block;
      }
    }
    return null;
  }
  
  private evaluateConditions(conditions?: Condition[]): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    
    return conditions.every(cond => this.evaluateCondition(cond));
  }
  
  private evaluateCondition(condition: Condition): boolean {
    const value = this.variables.get(condition.flag);
    
    switch (condition.operator) {
      case 'is_set':
        return value !== undefined && value !== false && value !== 0 && value !== '';
      case 'is_not_set':
        return value === undefined || value === false || value === 0 || value === '';
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return typeof value === 'number' && value > condition.value;
      case 'less_than':
        return typeof value === 'number' && value < condition.value;
      case 'greater_equal':
        return typeof value === 'number' && value >= condition.value;
      case 'less_equal':
        return typeof value === 'number' && value <= condition.value;
      default:
        return true;
    }
  }
  
  private processCommands(content: string): void {
    // Extract and process <<set>> commands
    const setRegex = /<<set\s+\$(\w+)\s*([+\-*/=]+)\s*(.+?)>>/g;
    let match;
    
    while ((match = setRegex.exec(content)) !== null) {
      const [, varName, operator, valueStr] = match;
      this.processSetCommand(varName, operator, valueStr.trim());
    }
  }
  
  private processSetCommand(varName: string, operator: string, valueStr: string): void {
    const currentValue = this.variables.get(varName);
    const parsedValue = this.parseValue(valueStr);
    
    switch (operator) {
      case '=':
        this.variables.set(varName, parsedValue);
        break;
      case '+=':
        if (typeof currentValue === 'number' && typeof parsedValue === 'number') {
          this.variables.set(varName, currentValue + parsedValue);
        }
        break;
      case '-=':
        if (typeof currentValue === 'number' && typeof parsedValue === 'number') {
          this.variables.set(varName, currentValue - parsedValue);
        }
        break;
      case '*=':
        if (typeof currentValue === 'number' && typeof parsedValue === 'number') {
          this.variables.set(varName, currentValue * parsedValue);
        }
        break;
      case '/=':
        if (typeof currentValue === 'number' && typeof parsedValue === 'number') {
          this.variables.set(varName, currentValue / parsedValue);
        }
        break;
    }
  }
  
  private parseValue(valueStr: string): VariableValue {
    // Boolean
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;
    
    // Number
    const num = parseFloat(valueStr);
    if (!isNaN(num)) return num;
    
    // String (remove quotes)
    if ((valueStr.startsWith('"') && valueStr.endsWith('"')) ||
        (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
      return valueStr.slice(1, -1);
    }
    
    return valueStr;
  }
}

