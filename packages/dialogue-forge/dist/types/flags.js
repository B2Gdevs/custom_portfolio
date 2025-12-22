"use strict";
/**
 * Flag System for Dialogue Forge
 *
 * Flags represent game state that can be checked and modified by dialogues.
 * Different flag types serve different purposes in the game.
 *
 * @example
 * ```typescript
 * import { FLAG_TYPE, FlagSchema } from '@portfolio/dialogue-forge';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleFlagSchema = void 0;
const constants_1 = require("./constants");
/**
 * Example flag schema for a game
 */
exports.exampleFlagSchema = {
    categories: ['quests', 'achievements', 'items', 'stats', 'titles'],
    flags: [
        // Quest flags
        { id: 'quest_dragon_slayer', name: 'Dragon Slayer Quest', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
        { id: 'quest_dragon_slayer_complete', name: 'Dragon Slayer Complete', type: constants_1.FLAG_TYPE.QUEST, category: 'quests' },
        // Achievement flags
        { id: 'achievement_first_quest', name: 'First Quest', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
        { id: 'achievement_dragon_slayer', name: 'Dragon Slayer', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
        // Item flags
        { id: 'item_ancient_key', name: 'Ancient Key', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
        { id: 'item_gold', name: 'Gold', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
        // Stat flags
        { id: 'stat_reputation', name: 'Reputation', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
        { id: 'stat_charisma', name: 'Charisma', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
        // Title flags
        { id: 'title_hero', name: 'Hero', type: constants_1.FLAG_TYPE.TITLE, category: 'titles' },
        // Dialogue flags (temporary, dialogue-scoped)
        { id: 'dialogue_met_stranger', name: 'Met Stranger', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
        { id: 'dialogue_seeks_knowledge', name: 'Seeks Knowledge', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
        { id: 'dialogue_hostile', name: 'Hostile Response', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
    ]
};
