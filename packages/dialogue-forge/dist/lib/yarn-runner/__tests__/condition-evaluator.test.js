"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const condition_evaluator_1 = require("../condition-evaluator");
const constants_1 = require("../../../types/constants");
(0, vitest_1.describe)('condition-evaluator', () => {
    (0, vitest_1.describe)('evaluateCondition', () => {
        const variables = {
            flag1: true,
            flag2: false,
            flag3: 42,
            flag4: 'hello',
            flag5: 0,
        };
        const memoryFlags = new Set(['memory1', 'memory2']);
        (0, vitest_1.it)('should evaluate IS_SET correctly', () => {
            const condition = {
                flag: 'flag1',
                operator: constants_1.CONDITION_OPERATOR.IS_SET,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag2',
                operator: constants_1.CONDITION_OPERATOR.IS_SET,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(false);
            const condition3 = {
                flag: 'memory1',
                operator: constants_1.CONDITION_OPERATOR.IS_SET,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition3, variables, memoryFlags)).toBe(true);
        });
        (0, vitest_1.it)('should evaluate IS_NOT_SET correctly', () => {
            const condition = {
                flag: 'nonexistent',
                operator: constants_1.CONDITION_OPERATOR.IS_NOT_SET,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag1',
                operator: constants_1.CONDITION_OPERATOR.IS_NOT_SET,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(false);
        });
        (0, vitest_1.it)('should evaluate EQUALS correctly', () => {
            const condition = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.EQUALS,
                value: 42,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag4',
                operator: constants_1.CONDITION_OPERATOR.EQUALS,
                value: 'hello',
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(true);
            const condition3 = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.EQUALS,
                value: 10,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition3, variables, memoryFlags)).toBe(false);
        });
        (0, vitest_1.it)('should evaluate NOT_EQUALS correctly', () => {
            const condition = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.NOT_EQUALS,
                value: 10,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.NOT_EQUALS,
                value: 42,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(false);
        });
        (0, vitest_1.it)('should evaluate GREATER_THAN correctly', () => {
            const condition = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.GREATER_THAN,
                value: 40,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.GREATER_THAN,
                value: 50,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(false);
        });
        (0, vitest_1.it)('should evaluate LESS_THAN correctly', () => {
            const condition = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.LESS_THAN,
                value: 50,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.LESS_THAN,
                value: 40,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(false);
        });
        (0, vitest_1.it)('should evaluate GREATER_EQUAL correctly', () => {
            const condition = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.GREATER_EQUAL,
                value: 42,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.GREATER_EQUAL,
                value: 41,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(true);
        });
        (0, vitest_1.it)('should evaluate LESS_EQUAL correctly', () => {
            const condition = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.LESS_EQUAL,
                value: 42,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'flag3',
                operator: constants_1.CONDITION_OPERATOR.LESS_EQUAL,
                value: 43,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(true);
        });
        (0, vitest_1.it)('should treat undefined as 0 for numeric comparisons', () => {
            const condition = {
                flag: 'nonexistent',
                operator: constants_1.CONDITION_OPERATOR.GREATER_THAN,
                value: -1,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition, variables, memoryFlags)).toBe(true);
            const condition2 = {
                flag: 'nonexistent',
                operator: constants_1.CONDITION_OPERATOR.LESS_THAN,
                value: 1,
            };
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateCondition)(condition2, variables, memoryFlags)).toBe(true);
        });
    });
    (0, vitest_1.describe)('evaluateConditions', () => {
        const variables = {
            flag1: true,
            flag2: 42,
        };
        (0, vitest_1.it)('should return true when all conditions are true', () => {
            const conditions = [
                { flag: 'flag1', operator: constants_1.CONDITION_OPERATOR.IS_SET },
                { flag: 'flag2', operator: constants_1.CONDITION_OPERATOR.EQUALS, value: 42 },
            ];
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateConditions)(conditions, variables)).toBe(true);
        });
        (0, vitest_1.it)('should return false when any condition is false', () => {
            const conditions = [
                { flag: 'flag1', operator: constants_1.CONDITION_OPERATOR.IS_SET },
                { flag: 'flag2', operator: constants_1.CONDITION_OPERATOR.EQUALS, value: 10 },
            ];
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateConditions)(conditions, variables)).toBe(false);
        });
        (0, vitest_1.it)('should return true for empty conditions array', () => {
            (0, vitest_1.expect)((0, condition_evaluator_1.evaluateConditions)([], variables)).toBe(true);
        });
    });
});
