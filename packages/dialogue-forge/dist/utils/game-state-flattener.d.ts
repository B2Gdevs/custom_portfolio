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
import type { FlagState } from '../types/game-state';
export interface FlattenConfig {
    /** Skip null/undefined values (default: true) */
    excludeNull?: boolean;
    /** Separator for nested keys (default: '_') */
    separator?: string;
    /** Maximum depth to flatten (default: 5, prevents infinite recursion) */
    maxDepth?: number;
}
export interface FlattenedState {
    flags: FlagState;
    metadata: {
        sourcePaths: Record<string, string>;
    };
}
/**
 * Flattens a game state object into Yarn Spinner-compatible flat variables
 */
export declare function flattenGameState(gameState: any, config?: FlattenConfig): FlattenedState;
/**
 * Validates that gameState has a valid structure
 * Throws descriptive errors if validation fails
 */
export declare function validateGameState(gameState: any): asserts gameState is Record<string, any>;
/**
 * Extracts flags from gameState, flattening if necessary
 * This is the main entry point for ScenePlayer
 */
export declare function extractFlagsFromGameState(gameState: any, config?: FlattenConfig): FlagState;
