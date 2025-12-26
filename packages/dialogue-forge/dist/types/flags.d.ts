/**
 * Flag System for Dialogue Forge
 *
 * Flags represent game state that can be checked and modified by dialogues.
 * Different flag types serve different purposes in the game.
 *
 * @example
 * ```typescript
 * import { FLAG_TYPE, FlagSchema } from '@magicborn/dialogue-forge';
 *
 * const mySchema: FlagSchema = {
 *   flags: [
 *     {
 *       id: 'quest_main',
 *       name: 'Main Quest',
 *       type: FLAG_TYPE.QUEST,
 *       category: 'quests'
 *     }
 *   ]
 * };
 * ```
 */
import { FLAG_TYPE, FlagValueType } from './constants';
export type FlagType = typeof FLAG_TYPE[keyof typeof FLAG_TYPE];
export interface FlagDefinition {
    id: string;
    name: string;
    description?: string;
    type: FlagType;
    category?: string;
    defaultValue?: boolean | number | string;
    valueType?: FlagValueType;
}
export interface FlagSchema {
    flags: FlagDefinition[];
    categories?: string[];
}
/**
 * Flag Reference - used in dialogue nodes
 */
export interface FlagReference {
    flagId: string;
    operator?: 'is_set' | 'is_not_set' | 'equals' | 'greater_than' | 'less_than';
    value?: boolean | number | string;
}
/**
 * Example flag schema for a game
 */
export declare const exampleFlagSchema: FlagSchema;
