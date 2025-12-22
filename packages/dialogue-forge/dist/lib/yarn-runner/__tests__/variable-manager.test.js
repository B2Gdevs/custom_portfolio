"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const variable_manager_1 = require("../variable-manager");
(0, vitest_1.describe)('VariableManager', () => {
    let manager;
    (0, vitest_1.beforeEach)(() => {
        manager = new variable_manager_1.VariableManager();
    });
    (0, vitest_1.describe)('constructor', () => {
        (0, vitest_1.it)('should initialize with empty state by default', () => {
            (0, vitest_1.expect)(manager.get('test')).toBeUndefined();
            (0, vitest_1.expect)(manager.getAllMemoryFlags().size).toBe(0);
        });
        (0, vitest_1.it)('should initialize with provided variables', () => {
            const vars = { flag1: true, flag2: 42 };
            const manager2 = new variable_manager_1.VariableManager(vars);
            (0, vitest_1.expect)(manager2.get('flag1')).toBe(true);
            (0, vitest_1.expect)(manager2.get('flag2')).toBe(42);
        });
        (0, vitest_1.it)('should initialize with provided memory flags', () => {
            const memoryFlags = new Set(['mem1', 'mem2']);
            const manager2 = new variable_manager_1.VariableManager(undefined, memoryFlags);
            (0, vitest_1.expect)(manager2.hasMemoryFlag('mem1')).toBe(true);
            (0, vitest_1.expect)(manager2.hasMemoryFlag('mem2')).toBe(true);
        });
    });
    (0, vitest_1.describe)('set and get', () => {
        (0, vitest_1.it)('should set and get boolean values', () => {
            manager.set('flag1', true);
            (0, vitest_1.expect)(manager.get('flag1')).toBe(true);
        });
        (0, vitest_1.it)('should set and get number values', () => {
            manager.set('flag2', 42);
            (0, vitest_1.expect)(manager.get('flag2')).toBe(42);
        });
        (0, vitest_1.it)('should set and get string values', () => {
            manager.set('flag3', 'hello');
            (0, vitest_1.expect)(manager.get('flag3')).toBe('hello');
        });
        (0, vitest_1.it)('should return undefined for unset variables', () => {
            (0, vitest_1.expect)(manager.get('nonexistent')).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('memory flags', () => {
        (0, vitest_1.it)('should add memory flags', () => {
            manager.addMemoryFlag('mem1');
            (0, vitest_1.expect)(manager.hasMemoryFlag('mem1')).toBe(true);
            (0, vitest_1.expect)(manager.get('mem1')).toBe(true);
        });
        (0, vitest_1.it)('should remove memory flags', () => {
            manager.addMemoryFlag('mem1');
            manager.removeMemoryFlag('mem1');
            (0, vitest_1.expect)(manager.hasMemoryFlag('mem1')).toBe(false);
        });
        (0, vitest_1.it)('should return memory flags as true when getting', () => {
            manager.addMemoryFlag('mem1');
            (0, vitest_1.expect)(manager.get('mem1')).toBe(true);
        });
    });
    (0, vitest_1.describe)('getAllVariables', () => {
        (0, vitest_1.it)('should return a copy of all variables', () => {
            manager.set('flag1', true);
            manager.set('flag2', 42);
            const vars = manager.getAllVariables();
            (0, vitest_1.expect)(vars).toEqual({ flag1: true, flag2: 42 });
            // Should be a copy, not a reference
            vars.flag1 = false;
            (0, vitest_1.expect)(manager.get('flag1')).toBe(true);
        });
    });
    (0, vitest_1.describe)('getAllMemoryFlags', () => {
        (0, vitest_1.it)('should return a copy of memory flags', () => {
            manager.addMemoryFlag('mem1');
            manager.addMemoryFlag('mem2');
            const flags = manager.getAllMemoryFlags();
            (0, vitest_1.expect)(flags.has('mem1')).toBe(true);
            (0, vitest_1.expect)(flags.has('mem2')).toBe(true);
            // Should be a copy
            flags.delete('mem1');
            (0, vitest_1.expect)(manager.hasMemoryFlag('mem1')).toBe(true);
        });
    });
    (0, vitest_1.describe)('clearMemoryFlags', () => {
        (0, vitest_1.it)('should clear all memory flags', () => {
            manager.addMemoryFlag('mem1');
            manager.addMemoryFlag('mem2');
            manager.clearMemoryFlags();
            (0, vitest_1.expect)(manager.getAllMemoryFlags().size).toBe(0);
        });
    });
    (0, vitest_1.describe)('reset', () => {
        (0, vitest_1.it)('should reset to initial state', () => {
            manager.set('flag1', true);
            manager.addMemoryFlag('mem1');
            manager.reset();
            (0, vitest_1.expect)(manager.get('flag1')).toBeUndefined();
            (0, vitest_1.expect)(manager.hasMemoryFlag('mem1')).toBe(false);
        });
        (0, vitest_1.it)('should reset to provided state', () => {
            manager.set('flag1', true);
            manager.reset({ flag2: 42 }, new Set(['mem2']));
            (0, vitest_1.expect)(manager.get('flag1')).toBeUndefined();
            (0, vitest_1.expect)(manager.get('flag2')).toBe(42);
            (0, vitest_1.expect)(manager.hasMemoryFlag('mem2')).toBe(true);
        });
    });
});
