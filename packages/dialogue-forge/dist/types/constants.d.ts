/**
 * Type-safe constants for Dialogue Forge
 * Use these instead of string literals for better type safety and IDE support
 */
/**
 * Node types in a dialogue tree
 */
export declare const NODE_TYPE: {
    readonly NPC: "npc";
    readonly PLAYER: "player";
    readonly CONDITIONAL: "conditional";
};
export type NodeType = typeof NODE_TYPE[keyof typeof NODE_TYPE];
/**
 * Flag types for game state management
 */
export declare const FLAG_TYPE: {
    readonly DIALOGUE: "dialogue";
    readonly QUEST: "quest";
    readonly ACHIEVEMENT: "achievement";
    readonly ITEM: "item";
    readonly STAT: "stat";
    readonly TITLE: "title";
    readonly GLOBAL: "global";
};
/**
 * Condition operators for choice visibility
 */
export declare const CONDITION_OPERATOR: {
    readonly IS_SET: "is_set";
    readonly IS_NOT_SET: "is_not_set";
    readonly EQUALS: "equals";
    readonly NOT_EQUALS: "not_equals";
    readonly GREATER_THAN: "greater_than";
    readonly LESS_THAN: "less_than";
    readonly GREATER_EQUAL: "greater_equal";
    readonly LESS_EQUAL: "less_equal";
};
export type ConditionOperator = typeof CONDITION_OPERATOR[keyof typeof CONDITION_OPERATOR];
/**
 * Flag value types
 */
export declare const FLAG_VALUE_TYPE: {
    readonly BOOLEAN: "boolean";
    readonly NUMBER: "number";
    readonly STRING: "string";
};
export type FlagValueType = typeof FLAG_VALUE_TYPE[keyof typeof FLAG_VALUE_TYPE];
/**
 * Quest state values (common states for quest flags)
 */
export declare const QUEST_STATE: {
    readonly NOT_STARTED: "not_started";
    readonly STARTED: "started";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
export type QuestState = typeof QUEST_STATE[keyof typeof QUEST_STATE];
