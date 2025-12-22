import { Condition } from '../../types';
export interface VariableState {
    [key: string]: boolean | number | string | undefined;
}
/**
 * Evaluates a single condition against variable state
 */
export declare function evaluateCondition(condition: Condition, variables: VariableState, memoryFlags?: Set<string>): boolean;
/**
 * Evaluates multiple conditions with AND logic
 */
export declare function evaluateConditions(conditions: Condition[], variables: VariableState, memoryFlags?: Set<string>): boolean;
