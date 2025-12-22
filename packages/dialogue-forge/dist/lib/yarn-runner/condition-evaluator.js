"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateCondition = evaluateCondition;
exports.evaluateConditions = evaluateConditions;
const constants_1 = require("../../types/constants");
/**
 * Evaluates a single condition against variable state
 */
function evaluateCondition(condition, variables, memoryFlags) {
    let value = variables[condition.flag];
    // If not in variables, check memoryFlags (dialogue flags)
    if (value === undefined && memoryFlags) {
        value = memoryFlags.has(condition.flag) ? true : undefined;
    }
    // For numeric comparisons, treat undefined as 0
    const numericOperators = [
        constants_1.CONDITION_OPERATOR.GREATER_THAN,
        constants_1.CONDITION_OPERATOR.LESS_THAN,
        constants_1.CONDITION_OPERATOR.GREATER_EQUAL,
        constants_1.CONDITION_OPERATOR.LESS_EQUAL
    ];
    const isNumericComparison = numericOperators.includes(condition.operator);
    if (isNumericComparison && value === undefined) {
        value = 0;
    }
    switch (condition.operator) {
        case constants_1.CONDITION_OPERATOR.IS_SET:
            return value !== undefined && value !== false && value !== 0 && value !== '';
        case constants_1.CONDITION_OPERATOR.IS_NOT_SET:
            return value === undefined || value === false || value === 0 || value === '';
        case constants_1.CONDITION_OPERATOR.EQUALS:
            return value === condition.value;
        case constants_1.CONDITION_OPERATOR.NOT_EQUALS:
            return value !== condition.value;
        case constants_1.CONDITION_OPERATOR.GREATER_THAN:
            const numValueGT = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : 0);
            const numCondGT = typeof condition.value === 'number' ? condition.value : parseFloat(String(condition.value));
            return !isNaN(numValueGT) && !isNaN(numCondGT) && numValueGT > numCondGT;
        case constants_1.CONDITION_OPERATOR.LESS_THAN:
            const numValueLT = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : 0);
            const numCondLT = typeof condition.value === 'number' ? condition.value : parseFloat(String(condition.value));
            return !isNaN(numValueLT) && !isNaN(numCondLT) && numValueLT < numCondLT;
        case constants_1.CONDITION_OPERATOR.GREATER_EQUAL:
            const numValueGE = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : 0);
            const numCondGE = typeof condition.value === 'number' ? condition.value : parseFloat(String(condition.value));
            return !isNaN(numValueGE) && !isNaN(numCondGE) && numValueGE >= numCondGE;
        case constants_1.CONDITION_OPERATOR.LESS_EQUAL:
            const numValueLE = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : 0);
            const numCondLE = typeof condition.value === 'number' ? condition.value : parseFloat(String(condition.value));
            return !isNaN(numValueLE) && !isNaN(numCondLE) && numValueLE <= numCondLE;
        default:
            return true;
    }
}
/**
 * Evaluates multiple conditions with AND logic
 */
function evaluateConditions(conditions, variables, memoryFlags) {
    return conditions.every(cond => evaluateCondition(cond, variables, memoryFlags));
}
