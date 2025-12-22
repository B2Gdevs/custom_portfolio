"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridLayoutStrategy = exports.ForceLayoutStrategy = exports.DagreLayoutStrategy = exports.layoutRegistry = exports.resolveNodeCollisions = exports.applyHierarchicalLayout = void 0;
exports.applyLayout = applyLayout;
exports.listLayouts = listLayouts;
exports.applyDagreLayout = applyDagreLayout;
const registry_1 = require("./registry");
const strategies_1 = require("./strategies");
// ============================================================================
// Register Built-in Strategies
// ============================================================================
// Register all built-in strategies
registry_1.layoutRegistry.register(new strategies_1.DagreLayoutStrategy(), true); // Default
registry_1.layoutRegistry.register(new strategies_1.ForceLayoutStrategy());
registry_1.layoutRegistry.register(new strategies_1.GridLayoutStrategy());
// ============================================================================
// Convenience Functions
// ============================================================================
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
function applyLayout(dialogue, strategyId, options) {
    return registry_1.layoutRegistry.apply(strategyId, dialogue, options);
}
/**
 * Get the list of available layout strategies
 */
function listLayouts() {
    return registry_1.layoutRegistry.list();
}
// ============================================================================
// Backward Compatibility
// ============================================================================
/**
 * Apply dagre layout (backward compatible function)
 * @deprecated Use applyLayout(dialogue, 'dagre', options) instead
 */
function applyDagreLayout(dialogue, direction = 'TB') {
    const result = applyLayout(dialogue, 'dagre', { direction });
    return result.dialogue;
}
/**
 * Apply hierarchical layout (backward compatible alias)
 * @deprecated Use applyLayout(dialogue, 'dagre', options) instead
 */
exports.applyHierarchicalLayout = applyDagreLayout;
/**
 * Resolve node collisions (kept for backward compatibility)
 */
var collision_1 = require("./collision");
Object.defineProperty(exports, "resolveNodeCollisions", { enumerable: true, get: function () { return collision_1.resolveNodeCollisions; } });
// Registry
var registry_2 = require("./registry");
Object.defineProperty(exports, "layoutRegistry", { enumerable: true, get: function () { return registry_2.layoutRegistry; } });
// Strategies (for direct use or extension)
var strategies_2 = require("./strategies");
Object.defineProperty(exports, "DagreLayoutStrategy", { enumerable: true, get: function () { return strategies_2.DagreLayoutStrategy; } });
Object.defineProperty(exports, "ForceLayoutStrategy", { enumerable: true, get: function () { return strategies_2.ForceLayoutStrategy; } });
Object.defineProperty(exports, "GridLayoutStrategy", { enumerable: true, get: function () { return strategies_2.GridLayoutStrategy; } });
