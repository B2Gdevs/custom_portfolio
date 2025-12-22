import { VariableState } from './condition-evaluator';
/**
 * Manages variable state for Yarn Spinner execution
 * Handles both game flags (persistent) and dialogue flags (temporary)
 */
export declare class VariableManager {
    private variables;
    private memoryFlags;
    constructor(initialVariables?: VariableState, initialMemoryFlags?: Set<string>);
    /**
     * Get a variable value
     */
    get(name: string): boolean | number | string | undefined;
    /**
     * Set a variable value
     */
    set(name: string, value: boolean | number | string): void;
    /**
     * Apply an operation to a variable (e.g., +=, -=, *=, /=)
     * If the variable doesn't exist, it's initialized to 0 for numeric operations
     */
    applyOperation(name: string, operator: '+' | '-' | '*' | '/', value: number): void;
    /**
     * Add a memory flag (dialogue flag - temporary)
     */
    addMemoryFlag(name: string): void;
    /**
     * Remove a memory flag
     */
    removeMemoryFlag(name: string): void;
    /**
     * Check if a memory flag exists
     */
    hasMemoryFlag(name: string): boolean;
    /**
     * Get all variables (persistent)
     */
    getAllVariables(): VariableState;
    /**
     * Get all memory flags
     */
    getAllMemoryFlags(): Set<string>;
    /**
     * Clear all memory flags (for dialogue reset)
     */
    clearMemoryFlags(): void;
    /**
     * Reset to initial state
     */
    reset(initialVariables?: VariableState, initialMemoryFlags?: Set<string>): void;
}
