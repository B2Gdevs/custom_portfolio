"use strict";
/**
 * Layout Strategy Registry
 *
 * Central registry for all available layout algorithms.
 * Implements the Registry pattern to manage strategy instances.
 *
 * @example
 * ```typescript
 * // Register a custom strategy
 * layoutRegistry.register(new MyCustomLayout());
 *
 * // Use a strategy
 * const result = layoutRegistry.apply('dagre', dialogue, { direction: 'LR' });
 *
 * // List available strategies
 * const strategies = layoutRegistry.list();
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.layoutRegistry = void 0;
// ============================================================================
// Registry Implementation
// ============================================================================
class LayoutStrategyRegistry {
    constructor() {
        this.strategies = new Map();
        this.defaultStrategyId = null;
    }
    /**
     * Register a layout strategy
     * @param strategy - The strategy to register
     * @param isDefault - Whether this should be the default strategy
     */
    register(strategy, isDefault = false) {
        if (this.strategies.has(strategy.id)) {
            console.warn(`Layout strategy "${strategy.id}" is already registered. Overwriting.`);
        }
        this.strategies.set(strategy.id, { strategy, isDefault });
        if (isDefault || this.defaultStrategyId === null) {
            this.defaultStrategyId = strategy.id;
        }
    }
    /**
     * Unregister a layout strategy
     * @param id - The strategy ID to remove
     */
    unregister(id) {
        const removed = this.strategies.delete(id);
        if (removed && this.defaultStrategyId === id) {
            // Set a new default if we removed the default
            const first = this.strategies.keys().next().value;
            this.defaultStrategyId = first || null;
        }
        return removed;
    }
    /**
     * Get a strategy by ID
     * @param id - The strategy ID
     */
    get(id) {
        return this.strategies.get(id)?.strategy;
    }
    /**
     * Get the default strategy
     */
    getDefault() {
        if (!this.defaultStrategyId)
            return undefined;
        return this.get(this.defaultStrategyId);
    }
    /**
     * Set the default strategy
     * @param id - The strategy ID to set as default
     */
    setDefault(id) {
        if (!this.strategies.has(id)) {
            console.warn(`Cannot set default: strategy "${id}" not found`);
            return false;
        }
        this.defaultStrategyId = id;
        return true;
    }
    /**
     * List all registered strategies
     */
    list() {
        return Array.from(this.strategies.entries()).map(([id, entry]) => ({
            id,
            name: entry.strategy.name,
            description: entry.strategy.description,
            isDefault: id === this.defaultStrategyId,
        }));
    }
    /**
     * Apply a layout strategy to a dialogue tree
     * @param id - The strategy ID (or undefined to use default)
     * @param dialogue - The dialogue tree to layout
     * @param options - Layout options
     */
    apply(id, dialogue, options) {
        const strategyId = id || this.defaultStrategyId;
        if (!strategyId) {
            throw new Error('No layout strategy available. Register a strategy first.');
        }
        const strategy = this.get(strategyId);
        if (!strategy) {
            throw new Error(`Layout strategy "${strategyId}" not found`);
        }
        // Check if strategy supports this dialogue
        if (strategy.supports && !strategy.supports(dialogue)) {
            console.warn(`Strategy "${strategyId}" may not support this dialogue structure`);
        }
        return strategy.apply(dialogue, options);
    }
    /**
     * Check if a strategy is registered
     * @param id - The strategy ID
     */
    has(id) {
        return this.strategies.has(id);
    }
    /**
     * Get the number of registered strategies
     */
    get size() {
        return this.strategies.size;
    }
    /**
     * Clear all registered strategies
     */
    clear() {
        this.strategies.clear();
        this.defaultStrategyId = null;
    }
}
// ============================================================================
// Singleton Instance
// ============================================================================
/**
 * Global layout strategy registry
 *
 * Use this to register custom strategies or apply layouts:
 * ```typescript
 * import { layoutRegistry } from './layout';
 *
 * // Apply layout
 * const result = layoutRegistry.apply('dagre', dialogue);
 * ```
 */
exports.layoutRegistry = new LayoutStrategyRegistry();
