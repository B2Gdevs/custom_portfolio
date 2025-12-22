/**
 * Layout Utilities - Re-export from modular layout system
 *
 * This file provides backward compatibility.
 * For new code, import directly from './layout/index.ts'
 *
 * @see LAYOUT_STRATEGIES.md for documentation
 */
export { applyLayout, listLayouts, applyDagreLayout, applyHierarchicalLayout, resolveNodeCollisions, type LayoutStrategy, type LayoutOptions, type LayoutResult, type LayoutDirection, layoutRegistry, DagreLayoutStrategy, ForceLayoutStrategy, GridLayoutStrategy, } from './layout/index';
