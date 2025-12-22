/**
 * Type-safe constants for Dialogue Forge
 * Use these instead of string literals for better type safety and IDE support
 */
/**
 * Node types in a dialogue tree
 */
export const NODE_TYPE = {
    NPC: 'npc',
    PLAYER: 'player',
    CONDITIONAL: 'conditional',
};
/**
 * Flag types for game state management
 */
export const FLAG_TYPE = {
    DIALOGUE: 'dialogue',
    QUEST: 'quest',
    ACHIEVEMENT: 'achievement',
    ITEM: 'item',
    STAT: 'stat',
    TITLE: 'title',
    GLOBAL: 'global',
};
/**
 * Condition operators for choice visibility
 */
export const CONDITION_OPERATOR = {
    IS_SET: 'is_set',
    IS_NOT_SET: 'is_not_set',
    EQUALS: 'equals',
    NOT_EQUALS: 'not_equals',
    GREATER_THAN: 'greater_than',
    LESS_THAN: 'less_than',
    GREATER_EQUAL: 'greater_equal',
    LESS_EQUAL: 'less_equal',
};
/**
 * Flag value types
 */
export const FLAG_VALUE_TYPE = {
    BOOLEAN: 'boolean',
    NUMBER: 'number',
    STRING: 'string',
};
/**
 * Quest state values (common states for quest flags)
 */
export const QUEST_STATE = {
    NOT_STARTED: 'not_started',
    STARTED: 'started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed',
};
