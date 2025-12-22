/**
 * Layout Module
 *
 * Provides automatic graph layout algorithms for dialogue trees.
 * Uses the Strategy pattern to allow swappable layout algorithms.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { layoutRegistry, applyLayout } from './layout';
 *
 * // Apply default layout (dagre)
 * const result = applyLayout(dialogue);
 *
 * // Apply specific layout
 * const result = applyLayout(dialogue, 'force');
 *
 * // With options
 * const result = applyLayout(dialogue, 'dagre', { direction: 'LR' });
 *
 * // List available layouts
 * console.log(layoutRegistry.list());
 * ```
 *
 * ## Adding Custom Layouts
 *
 * See LAYOUT_STRATEGIES.md for documentation on creating custom layouts.
 *
 * @module layout
 */
import { DialogueTree } from '../../types';
import { LayoutOptions, LayoutResult, LayoutDirection } from './types';
/**
 * Apply a layout algorithm to a dialogue tree
 *
 * @param dialogue - The dialogue tree to layout
 * @param strategyId - Optional strategy ID (defaults to 'dagre')
 * @param options - Optional layout configuration
 * @returns Layout result with updated dialogue and metadata
 *
 * @example
 * ```typescript
 * // Default dagre layout
 * const result = applyLayout(dialogue);
 *
 * // Horizontal dagre layout
 * const result = applyLayout(dialogue, 'dagre', { direction: 'LR' });
 *
 * // Force-directed layout
 * const result = applyLayout(dialogue, 'force');
 *
 * // Grid layout
 * const result = applyLayout(dialogue, 'grid');
 * ```
 */
export declare function applyLayout(dialogue: DialogueTree, strategyId?: string, options?: LayoutOptions): LayoutResult;
/**
 * Get the list of available layout strategies
 */
export declare function listLayouts(): Array<{
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
}>;
/**
 * Apply dagre layout (backward compatible function)
 * @deprecated Use applyLayout(dialogue, 'dagre', options) instead
 */
export declare function applyDagreLayout(dialogue: DialogueTree, direction?: LayoutDirection): DialogueTree;
/**
 * Apply hierarchical layout (backward compatible alias)
 * @deprecated Use applyLayout(dialogue, 'dagre', options) instead
 */
export declare const applyHierarchicalLayout: typeof applyDagreLayout;
/**
 * Resolve node collisions (kept for backward compatibility)
 */
export { resolveNodeCollisions } from './collision';
export type { LayoutStrategy, LayoutOptions, LayoutResult, LayoutDirection } from './types';
export { layoutRegistry } from './registry';
export { DagreLayoutStrategy, ForceLayoutStrategy, GridLayoutStrategy } from './strategies';
