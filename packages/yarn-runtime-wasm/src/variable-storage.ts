/**
 * Variable storage for runtime
 */

export type VariableValue = string | number | boolean;

export interface VariableStorage {
  get(name: string): VariableValue | undefined;
  set(name: string, value: VariableValue): void;
  has(name: string): boolean;
  delete(name: string): boolean;
  clear(): void;
  getAll(): Map<string, VariableValue>;
  getAllNames(): string[];
}

export class InMemoryVariableStorage implements VariableStorage {
  private variables = new Map<string, VariableValue>();
  
  constructor(initial?: Record<string, VariableValue>) {
    if (initial) {
      for (const [key, value] of Object.entries(initial)) {
        this.variables.set(key, value);
      }
    }
  }
  
  get(name: string): VariableValue | undefined {
    return this.variables.get(name);
  }
  
  set(name: string, value: VariableValue): void {
    this.variables.set(name, value);
  }
  
  has(name: string): boolean {
    return this.variables.has(name);
  }
  
  delete(name: string): boolean {
    return this.variables.delete(name);
  }
  
  clear(): void {
    this.variables.clear();
  }
  
  getAll(): Map<string, VariableValue> {
    return new Map(this.variables);
  }
  
  getAllNames(): string[] {
    return Array.from(this.variables.keys());
  }
}

