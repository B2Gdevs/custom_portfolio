"use strict";
/**
 * Layout Utilities - Re-export from modular layout system
 *
 * This file provides backward compatibility.
 * For new code, import directly from './layout/index.ts'
 *
 * @see LAYOUT_STRATEGIES.md for documentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridLayoutStrategy = exports.ForceLayoutStrategy = exports.DagreLayoutStrategy = exports.layoutRegistry = exports.resolveNodeCollisions = exports.applyHierarchicalLayout = exports.applyDagreLayout = exports.listLayouts = exports.applyLayout = void 0;
var index_1 = require("./layout/index");
// Main functions
Object.defineProperty(exports, "applyLayout", { enumerable: true, get: function () { return index_1.applyLayout; } });
Object.defineProperty(exports, "listLayouts", { enumerable: true, get: function () { return index_1.listLayouts; } });
// Backward compatibility
Object.defineProperty(exports, "applyDagreLayout", { enumerable: true, get: function () { return index_1.applyDagreLayout; } });
Object.defineProperty(exports, "applyHierarchicalLayout", { enumerable: true, get: function () { return index_1.applyHierarchicalLayout; } });
Object.defineProperty(exports, "resolveNodeCollisions", { enumerable: true, get: function () { return index_1.resolveNodeCollisions; } });
// Registry
Object.defineProperty(exports, "layoutRegistry", { enumerable: true, get: function () { return index_1.layoutRegistry; } });
// Strategies (for extension)
Object.defineProperty(exports, "DagreLayoutStrategy", { enumerable: true, get: function () { return index_1.DagreLayoutStrategy; } });
Object.defineProperty(exports, "ForceLayoutStrategy", { enumerable: true, get: function () { return index_1.ForceLayoutStrategy; } });
Object.defineProperty(exports, "GridLayoutStrategy", { enumerable: true, get: function () { return index_1.GridLayoutStrategy; } });
