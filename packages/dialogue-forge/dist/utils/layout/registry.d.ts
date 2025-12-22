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
import { DialogueTree } from '../../types';
import { LayoutStrategy, LayoutOptions, LayoutResult } from './types';
declare class LayoutStrategyRegistry {
    private strategies;
    private defaultStrategyId;
    /**
     * Register a layout strategy
     * @param strategy - The strategy to register
     * @param isDefault - Whether this should be the default strategy
     */
    register(strategy: LayoutStrategy, isDefault?: boolean): void;
    /**
     * Unregister a layout strategy
     * @param id - The strategy ID to remove
     */
    unregister(id: string): boolean;
    /**
     * Get a strategy by ID
     * @param id - The strategy ID
     */
    get(id: string): LayoutStrategy | undefined;
    /**
     * Get the default strategy
     */
    getDefault(): LayoutStrategy | undefined;
    /**
     * Set the default strategy
     * @param id - The strategy ID to set as default
     */
    setDefault(id: string): boolean;
    /**
     * List all registered strategies
     */
    list(): Array<{
        id: string;
        name: string;
        description: string;
        isDefault: boolean;
    }>;
    /**
     * Apply a layout strategy to a dialogue tree
     * @param id - The strategy ID (or undefined to use default)
     * @param dialogue - The dialogue tree to layout
     * @param options - Layout options
     */
    apply(id: string | undefined, dialogue: DialogueTree, options?: LayoutOptions): LayoutResult;
    /**
     * Check if a strategy is registered
     * @param id - The strategy ID
     */
    has(id: string): boolean;
    /**
     * Get the number of registered strategies
     */
    get size(): number;
    /**
     * Clear all registered strategies
     */
    clear(): void;
}
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
export declare const layoutRegistry: LayoutStrategyRegistry;
export {};
