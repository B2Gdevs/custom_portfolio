import { VariableState } from './condition-evaluator';

/**
 * Manages variable state for Yarn Spinner execution
 * Handles both game flags (persistent) and dialogue flags (temporary)
 */
export class VariableManager {
  private variables: VariableState = {};
  private memoryFlags: Set<string> = new Set();
  
  constructor(initialVariables?: VariableState, initialMemoryFlags?: Set<string>) {
    if (initialVariables) {
      this.variables = { ...initialVariables };
    }
    if (initialMemoryFlags) {
      this.memoryFlags = new Set(initialMemoryFlags);
    }
  }
  
  /**
   * Get a variable value
   */
  get(name: string): boolean | number | string | undefined {
    // Check persistent variables first
    if (this.variables[name] !== undefined) {
      return this.variables[name];
    }
    // Check memory flags (dialogue flags)
    if (this.memoryFlags.has(name)) {
      return true;
    }
    return undefined;
  }
  
  /**
   * Set a variable value
   */
  set(name: string, value: boolean | number | string): void {
    this.variables[name] = value;
  }
  
  /**
   * Add a memory flag (dialogue flag - temporary)
   */
  addMemoryFlag(name: string): void {
    this.memoryFlags.add(name);
  }
  
  /**
   * Remove a memory flag
   */
  removeMemoryFlag(name: string): void {
    this.memoryFlags.delete(name);
  }
  
  /**
   * Check if a memory flag exists
   */
  hasMemoryFlag(name: string): boolean {
    return this.memoryFlags.has(name);
  }
  
  /**
   * Get all variables (persistent)
   */
  getAllVariables(): VariableState {
    return { ...this.variables };
  }
  
  /**
   * Get all memory flags
   */
  getAllMemoryFlags(): Set<string> {
    return new Set(this.memoryFlags);
  }
  
  /**
   * Clear all memory flags (for dialogue reset)
   */
  clearMemoryFlags(): void {
    this.memoryFlags.clear();
  }
  
  /**
   * Reset to initial state
   */
  reset(initialVariables?: VariableState, initialMemoryFlags?: Set<string>): void {
    this.variables = initialVariables ? { ...initialVariables } : {};
    this.memoryFlags = initialMemoryFlags ? new Set(initialMemoryFlags) : new Set();
  }
}

