/**
 * Manages variable state for Yarn Spinner execution
 * Handles both game flags (persistent) and dialogue flags (temporary)
 */
export class VariableManager {
    constructor(initialVariables, initialMemoryFlags) {
        this.variables = {};
        this.memoryFlags = new Set();
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
    get(name) {
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
    set(name, value) {
        this.variables[name] = value;
    }
    /**
     * Apply an operation to a variable (e.g., +=, -=, *=, /=)
     * If the variable doesn't exist, it's initialized to 0 for numeric operations
     */
    applyOperation(name, operator, value) {
        const current = this.get(name);
        let currentNum;
        if (current === undefined) {
            currentNum = 0;
        }
        else if (typeof current === 'number') {
            currentNum = current;
        }
        else if (typeof current === 'string') {
            // Try to parse string as number
            const parsed = parseFloat(current);
            currentNum = isNaN(parsed) ? 0 : parsed;
        }
        else {
            // Boolean: treat true as 1, false as 0
            currentNum = current ? 1 : 0;
        }
        let result;
        switch (operator) {
            case '+':
                result = currentNum + value;
                break;
            case '-':
                result = currentNum - value;
                break;
            case '*':
                result = currentNum * value;
                break;
            case '/':
                result = value !== 0 ? currentNum / value : currentNum;
                break;
            default:
                result = currentNum;
        }
        this.variables[name] = result;
    }
    /**
     * Add a memory flag (dialogue flag - temporary)
     */
    addMemoryFlag(name) {
        this.memoryFlags.add(name);
    }
    /**
     * Remove a memory flag
     */
    removeMemoryFlag(name) {
        this.memoryFlags.delete(name);
    }
    /**
     * Check if a memory flag exists
     */
    hasMemoryFlag(name) {
        return this.memoryFlags.has(name);
    }
    /**
     * Get all variables (persistent)
     */
    getAllVariables() {
        return { ...this.variables };
    }
    /**
     * Get all memory flags
     */
    getAllMemoryFlags() {
        return new Set(this.memoryFlags);
    }
    /**
     * Clear all memory flags (for dialogue reset)
     */
    clearMemoryFlags() {
        this.memoryFlags.clear();
    }
    /**
     * Reset to initial state
     */
    reset(initialVariables, initialMemoryFlags) {
        this.variables = initialVariables ? { ...initialVariables } : {};
        this.memoryFlags = initialMemoryFlags ? new Set(initialMemoryFlags) : new Set();
    }
}
