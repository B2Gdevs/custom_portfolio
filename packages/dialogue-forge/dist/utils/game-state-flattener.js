"use strict";
/**
 * Game State Flattening Utility
 *
 * Flattens nested game state structures into Yarn Spinner-compatible flat variables.
 * Supports: flags, player, characters (as object), and any other nested structures.
 *
 * Rules:
 * - Only includes truthy values (skips 0, false, null, undefined, empty strings)
 * - Flattens nested objects using underscore separator
 * - Characters are objects, not arrays (uses object keys as part of path)
 * - All values must be boolean | number | string (Yarn-compatible)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenGameState = flattenGameState;
exports.validateGameState = validateGameState;
exports.extractFlagsFromGameState = extractFlagsFromGameState;
/**
 * Validates that a value is Yarn Spinner-compatible
 */
function isYarnCompatible(value) {
    return typeof value === 'boolean' ||
        typeof value === 'number' ||
        typeof value === 'string';
}
/**
 * Checks if a value is "truthy" for our purposes
 * - Numbers: only include if !== 0
 * - Booleans: only include if true
 * - Strings: only include if non-empty
 * - null/undefined: excluded if excludeNull is true
 */
function isTruthyValue(value, excludeNull) {
    if (value == null) {
        return !excludeNull; // Include null only if excludeNull is false
    }
    if (typeof value === 'number') {
        return value !== 0; // Exclude zero
    }
    if (typeof value === 'boolean') {
        return value === true; // Only include true
    }
    if (typeof value === 'string') {
        return value.length > 0; // Exclude empty strings
    }
    return true; // Objects/arrays will be flattened further
}
/**
 * Flattens a game state object into Yarn Spinner-compatible flat variables
 */
function flattenGameState(gameState, config = {}) {
    if (!gameState || typeof gameState !== 'object') {
        throw new Error('GameState must be an object');
    }
    const { excludeNull = true, separator = '_', maxDepth = 5, } = config;
    const flags = {};
    const sourcePaths = {};
    /**
     * Recursively flatten a value
     */
    function flattenValue(value, path, depth = 0) {
        // Prevent infinite recursion
        if (depth > maxDepth) {
            console.warn(`Max depth (${maxDepth}) reached at path: ${path}`);
            return;
        }
        // Handle primitives (Yarn-compatible types)
        if (isYarnCompatible(value)) {
            // Only include truthy values
            if (isTruthyValue(value, excludeNull)) {
                const key = path.replace(/\./g, separator);
                flags[key] = value;
                sourcePaths[key] = path;
            }
            return;
        }
        // Handle null/undefined
        if (value == null) {
            if (!excludeNull) {
                // Could store as string representation, but Yarn doesn't support null
                // Skip for now - Yarn only supports boolean | number | string
            }
            return;
        }
        // Handle arrays - flatten all items
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                const arrayPath = `${path}[${index}]`;
                flattenValue(item, arrayPath, depth + 1);
            });
            return;
        }
        // Handle objects - flatten all properties
        if (typeof value === 'object') {
            Object.entries(value).forEach(([key, val]) => {
                // Skip if value is not truthy (for nested objects, we still traverse)
                // but we'll check truthiness when we hit primitives
                const newPath = path ? `${path}.${key}` : key;
                flattenValue(val, newPath, depth + 1);
            });
            return;
        }
        // Unknown type - skip
        console.warn(`Skipping unsupported type at path: ${path} (type: ${typeof value})`);
    }
    // Flatten all top-level keys
    Object.entries(gameState).forEach(([key, value]) => {
        flattenValue(value, key, 0);
    });
    return {
        flags,
        metadata: {
            sourcePaths,
        },
    };
}
/**
 * Validates that gameState has a valid structure
 * Throws descriptive errors if validation fails
 */
function validateGameState(gameState) {
    if (gameState == null) {
        throw new Error('GameState cannot be null or undefined');
    }
    if (typeof gameState !== 'object') {
        throw new Error(`GameState must be an object, got: ${typeof gameState}`);
    }
    if (Array.isArray(gameState)) {
        throw new Error('GameState cannot be an array. Use an object with keys like { flags: {...}, player: {...} }');
    }
}
/**
 * Extracts flags from gameState, flattening if necessary
 * This is the main entry point for ScenePlayer
 */
function extractFlagsFromGameState(gameState, config) {
    validateGameState(gameState);
    const flattened = flattenGameState(gameState, config);
    return flattened.flags;
}
