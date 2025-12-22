"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleFlagSchemas = exports.examplesRegistry = void 0;
exports.getExampleMetadata = getExampleMetadata;
exports.listExampleIds = listExampleIds;
exports.getExampleFlagSchema = getExampleFlagSchema;
exports.listFlagSchemaIds = listFlagSchemaIds;
const constants_1 = require("../types/constants");
/**
 * Registry of all available examples
 * This is the single source of truth for example discovery
 */
exports.examplesRegistry = [
    {
        id: 'basic',
        title: 'Basic Dialogue Example',
        description: 'Simple dialogue with player choices',
        filename: 'basic-dialogue.yarn',
        flagSchemaId: 'basic',
        features: ['basic-choices']
    },
    {
        id: 'conditional',
        title: 'Conditional Dialogue Example',
        description: 'Dialogue with conditional choices based on flags',
        filename: 'conditional-dialogue.yarn',
        flagSchemaId: 'conditional',
        features: ['conditional-choices', 'flag-checks']
    },
    {
        id: 'quest-progression',
        title: 'Quest Progression Example',
        description: 'Quest system with progression and rewards',
        filename: 'quest-progression.yarn',
        flagSchemaId: 'rpg',
        features: ['quest-progression', 'flag-setting']
    },
    {
        id: 'complex-conditional',
        title: 'Complex Conditional Example',
        description: 'Advanced conditional logic with multiple branches',
        filename: 'complex-conditional.yarn',
        flagSchemaId: 'complex_conditional',
        features: ['conditional-nodes', 'multiple-branches', 'complex-conditions']
    },
    {
        id: 'variable-operations',
        title: 'Variable Operations Example',
        description: 'Demonstrates variable operations, interpolation, and numeric calculations',
        filename: 'variable-operations-example.yarn',
        flagSchemaId: 'rpg',
        features: ['variable-operations', 'variable-interpolation', 'numeric-calculations', 'string-variables']
    }
];
/**
 * Flag schemas for examples
 */
exports.exampleFlagSchemas = {
    basic: {
        categories: ['quests', 'items', 'stats'],
        flags: [
            { id: 'quest_intro', name: 'Introduction Quest', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'item_key', name: 'Key', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'stat_reputation', name: 'Reputation', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
        ]
    },
    conditional: {
        categories: ['quests', 'items', 'stats'],
        flags: [
            { id: 'quest_main', name: 'Main Quest', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'item_key', name: 'Key', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'stat_gold', name: 'Gold', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
            { id: 'stat_reputation', name: 'Reputation', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
        ]
    },
    rpg: {
        categories: ['quests', 'achievements', 'items', 'stats', 'titles'],
        flags: [
            { id: 'quest_dragon_slayer', name: 'Dragon Slayer Quest', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'quest_dragon_slayer_complete', name: 'Dragon Slayer Complete', type: constants_1.FLAG_TYPE.QUEST, category: 'quests' },
            { id: 'quest_find_key', name: 'Find the Key', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'achievement_first_quest', name: 'First Quest', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'achievement_dragon_slayer', name: 'Dragon Slayer', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'achievement_hero', name: 'Hero', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'item_ancient_key', name: 'Ancient Key', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'item_map', name: 'Treasure Map', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'item_sword', name: 'Legendary Sword', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'item_potion', name: 'Health Potion', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'stat_gold', name: 'Gold', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
            { id: 'stat_reputation', name: 'Reputation', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
            { id: 'stat_charisma', name: 'Charisma', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
            { id: 'stat_strength', name: 'Strength', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
            { id: 'stat_experience', name: 'Experience', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
            { id: 'title_hero', name: 'Hero', type: constants_1.FLAG_TYPE.TITLE, category: 'titles' },
            { id: 'title_merchant', name: 'Merchant', type: constants_1.FLAG_TYPE.TITLE, category: 'titles' },
            { id: 'player_name', name: 'Player Name', type: constants_1.FLAG_TYPE.GLOBAL, category: 'global', valueType: constants_1.FLAG_VALUE_TYPE.STRING, defaultValue: 'Traveler' },
            { id: 'location_name', name: 'Location Name', type: constants_1.FLAG_TYPE.GLOBAL, category: 'global', valueType: constants_1.FLAG_VALUE_TYPE.STRING, defaultValue: 'Town' },
            { id: 'player_title', name: 'Player Title', type: constants_1.FLAG_TYPE.TITLE, category: 'titles', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'greeting_count', name: 'Greeting Count', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
        ]
    },
    complex_conditional: {
        categories: ['quests', 'achievements', 'items', 'stats', 'titles', 'global', 'dialogue'],
        flags: [
            { id: 'quest_ancient_ruins', name: 'Ancient Ruins Quest', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'quest_ancient_ruins_complete', name: 'Ancient Ruins Complete', type: constants_1.FLAG_TYPE.QUEST, category: 'quests' },
            { id: 'quest_treasure_hunt', name: 'Treasure Hunt', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'quest_treasure_hunt_complete', name: 'Treasure Hunt Complete', type: constants_1.FLAG_TYPE.QUEST, category: 'quests' },
            { id: 'quest_dragon_slayer', name: 'Dragon Slayer Quest', type: constants_1.FLAG_TYPE.QUEST, category: 'quests', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'achievement_explorer', name: 'Explorer', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'achievement_rich', name: 'Rich', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'achievement_hero', name: 'Hero', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'achievement_diplomat', name: 'Diplomat', type: constants_1.FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
            { id: 'item_ancient_key', name: 'Ancient Key', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'item_treasure_map', name: 'Treasure Map', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'item_legendary_sword', name: 'Legendary Sword', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'item_gold_coin', name: 'Gold Coin', type: constants_1.FLAG_TYPE.ITEM, category: 'items' },
            { id: 'stat_gold', name: 'Gold', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
            { id: 'stat_reputation', name: 'Reputation', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
            { id: 'stat_charisma', name: 'Charisma', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
            { id: 'stat_strength', name: 'Strength', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
            { id: 'stat_wisdom', name: 'Wisdom', type: constants_1.FLAG_TYPE.STAT, category: 'stats', valueType: constants_1.FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
            { id: 'title_hero', name: 'Hero', type: constants_1.FLAG_TYPE.TITLE, category: 'titles' },
            { id: 'title_explorer', name: 'Explorer', type: constants_1.FLAG_TYPE.TITLE, category: 'titles' },
            { id: 'title_merchant', name: 'Merchant', type: constants_1.FLAG_TYPE.TITLE, category: 'titles' },
            { id: 'global_game_started', name: 'Game Started', type: constants_1.FLAG_TYPE.GLOBAL, category: 'global' },
            { id: 'global_first_visit', name: 'First Visit', type: constants_1.FLAG_TYPE.GLOBAL, category: 'global' },
            { id: 'global_difficulty', name: 'Difficulty', type: constants_1.FLAG_TYPE.GLOBAL, category: 'global', valueType: constants_1.FLAG_VALUE_TYPE.STRING },
            { id: 'dialogue_met_guard', name: 'Met Guard', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
            { id: 'dialogue_hostile', name: 'Hostile Response', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
            { id: 'dialogue_friendly', name: 'Friendly Response', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
            { id: 'dialogue_seeks_knowledge', name: 'Seeks Knowledge', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
            { id: 'dialogue_offered_bribe', name: 'Offered Bribe', type: constants_1.FLAG_TYPE.DIALOGUE, category: 'dialogue' },
        ]
    }
};
/**
 * Get example metadata by ID
 */
function getExampleMetadata(id) {
    return exports.examplesRegistry.find(ex => ex.id === id) || null;
}
/**
 * List all available example IDs
 */
function listExampleIds() {
    return exports.examplesRegistry.map(ex => ex.id);
}
/**
 * Get flag schema by ID
 */
function getExampleFlagSchema(id) {
    return exports.exampleFlagSchemas[id] || null;
}
/**
 * List all available flag schema IDs
 */
function listFlagSchemaIds() {
    return Object.keys(exports.exampleFlagSchemas);
}
