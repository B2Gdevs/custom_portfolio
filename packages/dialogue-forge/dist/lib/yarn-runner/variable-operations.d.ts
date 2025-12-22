import { VariableManager } from './variable-manager';
/**
 * Parses and executes a Yarn variable operation command
 * Supports:
 * - <<set $var = value>> (assignment)
 * - <<set $var += value>> (addition)
 * - <<set $var -= value>> (subtraction)
 * - <<set $var *= value>> (multiplication)
 * - <<set $var /= value>> (division)
 */
export declare function executeVariableOperation(command: string, variableManager: VariableManager): void;
/**
 * Extracts and executes all variable operations from a node's content
 * This processes any <<set>> commands embedded in the dialogue text
 */
export declare function processVariableOperationsInContent(content: string, variableManager: VariableManager): string;
