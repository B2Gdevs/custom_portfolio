import { GameFlagState } from '../types/game-state';
import { FlagSchema } from '../types/flags';
/**
 * Initialize game flags from schema with default values
 */
export declare function initializeFlags(schema: FlagSchema): GameFlagState;
/**
 * Merge current flags with updates from dialogue
 */
export declare function mergeFlagUpdates(currentFlags: GameFlagState, updates: string[], schema?: FlagSchema): GameFlagState;
/**
 * Validate flags against schema
 */
export declare function validateFlags(flags: GameFlagState, schema: FlagSchema): {
    valid: boolean;
    errors: string[];
};
/**
 * Get flag value with type safety
 */
export declare function getFlagValue(flags: GameFlagState, flagId: string, defaultValue?: boolean | number | string): boolean | number | string;
