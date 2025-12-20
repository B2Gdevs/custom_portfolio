import { DialogueTree } from '../types';
import { FlagSchema } from '../types/flags';
import { FLAG_TYPE, FLAG_VALUE_TYPE, NODE_TYPE, CONDITION_OPERATOR } from '../types/constants';

/**
 * Demo flag schemas for examples
 */
export const demoFlagSchemas: Record<string, FlagSchema> = {
  basic: {
    categories: ['quests', 'items', 'stats'],
    flags: [
      { id: 'quest_intro', name: 'Introduction Quest', type: FLAG_TYPE.QUEST, category: 'quests', valueType: FLAG_VALUE_TYPE.STRING },
      { id: 'item_key', name: 'Key', type: FLAG_TYPE.ITEM, category: 'items' },
      { id: 'stat_reputation', name: 'Reputation', type: FLAG_TYPE.STAT, category: 'stats', valueType: FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
    ]
  },
  
  rpg: {
    categories: ['quests', 'achievements', 'items', 'stats', 'titles'],
    flags: [
      // Quests
      { id: 'quest_dragon_slayer', name: 'Dragon Slayer Quest', type: FLAG_TYPE.QUEST, category: 'quests', valueType: FLAG_VALUE_TYPE.STRING },
      { id: 'quest_dragon_slayer_complete', name: 'Dragon Slayer Complete', type: FLAG_TYPE.QUEST, category: 'quests' },
      { id: 'quest_find_key', name: 'Find the Key', type: FLAG_TYPE.QUEST, category: 'quests', valueType: FLAG_VALUE_TYPE.STRING },
      
      // Achievements
      { id: 'achievement_first_quest', name: 'First Quest', type: FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
      { id: 'achievement_dragon_slayer', name: 'Dragon Slayer', type: FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
      { id: 'achievement_hero', name: 'Hero', type: FLAG_TYPE.ACHIEVEMENT, category: 'achievements' },
      
      // Items
      { id: 'item_ancient_key', name: 'Ancient Key', type: FLAG_TYPE.ITEM, category: 'items' },
      { id: 'item_map', name: 'Treasure Map', type: FLAG_TYPE.ITEM, category: 'items' },
      { id: 'item_sword', name: 'Legendary Sword', type: FLAG_TYPE.ITEM, category: 'items' },
      
      // Stats
      { id: 'stat_gold', name: 'Gold', type: FLAG_TYPE.STAT, category: 'stats', valueType: FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
      { id: 'stat_reputation', name: 'Reputation', type: FLAG_TYPE.STAT, category: 'stats', valueType: FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
      { id: 'stat_charisma', name: 'Charisma', type: FLAG_TYPE.STAT, category: 'stats', valueType: FLAG_VALUE_TYPE.NUMBER, defaultValue: 10 },
      
      // Titles
      { id: 'title_hero', name: 'Hero', type: FLAG_TYPE.TITLE, category: 'titles' },
      { id: 'title_merchant', name: 'Merchant', type: FLAG_TYPE.TITLE, category: 'titles' },
      
      // Dialogue flags
      { id: 'dialogue_met_stranger', name: 'Met Stranger', type: FLAG_TYPE.DIALOGUE, category: 'dialogue' },
      { id: 'dialogue_hostile', name: 'Hostile Response', type: FLAG_TYPE.DIALOGUE, category: 'dialogue' },
    ]
  },
  
  conditional: {
    categories: ['quests', 'items', 'stats'],
    flags: [
      { id: 'quest_main', name: 'Main Quest', type: FLAG_TYPE.QUEST, category: 'quests', valueType: FLAG_VALUE_TYPE.STRING },
      { id: 'item_key', name: 'Key', type: FLAG_TYPE.ITEM, category: 'items' },
      { id: 'stat_gold', name: 'Gold', type: FLAG_TYPE.STAT, category: 'stats', valueType: FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
      { id: 'stat_reputation', name: 'Reputation', type: FLAG_TYPE.STAT, category: 'stats', valueType: FLAG_VALUE_TYPE.NUMBER, defaultValue: 0 },
    ]
  }
};

/**
 * Example dialogues showcasing different features
 */
export const exampleDialogues: Record<string, DialogueTree> = {
  basic: {
    id: 'basic-example',
    title: 'Basic Dialogue Example',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        type: NODE_TYPE.NPC,
        speaker: 'Merchant',
        content: 'Welcome to my shop! How can I help you?',
        nextNodeId: 'player_choice',
        x: 300,
        y: 100
      },
      player_choice: {
        id: 'player_choice',
        type: NODE_TYPE.PLAYER,
        content: '',
        choices: [
          {
            id: 'buy',
            text: 'I want to buy something',
            nextNodeId: 'shop',
            setFlags: ['dialogue_shopping']
          },
          {
            id: 'sell',
            text: 'I want to sell something',
            nextNodeId: 'sell',
          },
          {
            id: 'leave',
            text: 'Never mind',
            nextNodeId: 'goodbye'
          }
        ],
        x: 300,
        y: 250
      },
      shop: {
        id: 'shop',
        type: NODE_TYPE.NPC,
        speaker: 'Merchant',
        content: 'What would you like to buy?',
        x: 100,
        y: 400
      },
      sell: {
        id: 'sell',
        type: NODE_TYPE.NPC,
        speaker: 'Merchant',
        content: 'Show me what you have.',
        x: 300,
        y: 400
      },
      goodbye: {
        id: 'goodbye',
        type: NODE_TYPE.NPC,
        speaker: 'Merchant',
        content: 'Come back anytime!',
        x: 500,
        y: 400
      }
    }
  },
  
  conditional: {
    id: 'conditional-example',
    title: 'Conditional Dialogue Example',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        type: NODE_TYPE.NPC,
        speaker: 'Guard',
        content: 'Halt! Who goes there?',
        nextNodeId: 'check_reputation',
        x: 300,
        y: 100
      },
      check_reputation: {
        id: 'check_reputation',
        type: NODE_TYPE.PLAYER,
        content: '',
        choices: [
          {
            id: 'high_rep',
            text: 'I am a hero of this land!',
            nextNodeId: 'high_rep_response',
            conditions: [
              { flag: 'stat_reputation', operator: CONDITION_OPERATOR.GREATER_THAN, value: 50 }
            ]
          },
          {
            id: 'low_rep',
            text: 'Just a traveler...',
            nextNodeId: 'low_rep_response',
            conditions: [
              { flag: 'stat_reputation', operator: CONDITION_OPERATOR.LESS_EQUAL, value: 50 }
            ]
          },
          {
            id: 'has_key',
            text: 'I have the key!',
            nextNodeId: 'key_response',
            conditions: [
              { flag: 'item_key', operator: CONDITION_OPERATOR.IS_SET }
            ]
          }
        ],
        x: 300,
        y: 250
      },
      high_rep_response: {
        id: 'high_rep_response',
        type: NODE_TYPE.NPC,
        speaker: 'Guard',
        content: 'Hero! Please, come in. The city welcomes you.',
        setFlags: ['stat_reputation'],
        x: 100,
        y: 400
      },
      low_rep_response: {
        id: 'low_rep_response',
        type: NODE_TYPE.NPC,
        speaker: 'Guard',
        content: 'Hmm... you may pass, but watch yourself.',
        x: 300,
        y: 400
      },
      key_response: {
        id: 'key_response',
        type: NODE_TYPE.NPC,
        speaker: 'Guard',
        content: 'Ah, you have the key! Please enter.',
        x: 500,
        y: 400
      }
    }
  },
  
  quest_progression: {
    id: 'quest-progression-example',
    title: 'Quest Progression Example',
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        type: NODE_TYPE.NPC,
        speaker: 'Quest Giver',
        content: 'I need your help! A dragon threatens our village.',
        nextNodeId: 'quest_offer',
        x: 300,
        y: 100
      },
      quest_offer: {
        id: 'quest_offer',
        type: NODE_TYPE.PLAYER,
        content: '',
        choices: [
          {
            id: 'accept',
            text: 'I will help you!',
            nextNodeId: 'quest_started',
            setFlags: ['quest_dragon_slayer']
          },
          {
            id: 'decline',
            text: 'I cannot help right now.',
            nextNodeId: 'quest_declined'
          }
        ],
        x: 300,
        y: 250
      },
      quest_started: {
        id: 'quest_started',
        type: NODE_TYPE.NPC,
        speaker: 'Quest Giver',
        content: 'Thank you! Here is a map to the dragon\'s lair.',
        setFlags: ['item_map', 'achievement_first_quest'],
        nextNodeId: 'quest_continue',
        x: 100,
        y: 400
      },
      quest_continue: {
        id: 'quest_continue',
        type: NODE_TYPE.PLAYER,
        content: '',
        choices: [
          {
            id: 'ask_details',
            text: 'Tell me more about the dragon',
            nextNodeId: 'dragon_info'
          },
          {
            id: 'leave',
            text: 'I will return when I have slain the dragon',
            nextNodeId: 'quest_end'
          }
        ],
        x: 100,
        y: 550
      },
      dragon_info: {
        id: 'dragon_info',
        type: NODE_TYPE.NPC,
        speaker: 'Quest Giver',
        content: 'The dragon is ancient and powerful. You will need the legendary sword to defeat it.',
        nextNodeId: 'quest_continue',
        x: 300,
        y: 550
      },
      quest_declined: {
        id: 'quest_declined',
        type: NODE_TYPE.NPC,
        speaker: 'Quest Giver',
        content: 'I understand. Return if you change your mind.',
        x: 500,
        y: 400
      },
      quest_end: {
        id: 'quest_end',
        type: NODE_TYPE.NPC,
        speaker: 'Narrator',
        content: 'You set off on your quest...\n\n— TO BE CONTINUED —',
        x: 100,
        y: 700
      }
    }
  }
};

/**
 * Get example dialogue by name
 */
export function getExampleDialogue(name: string): DialogueTree | null {
  return exampleDialogues[name] || null;
}

/**
 * Get demo flag schema by name
 */
export function getDemoFlagSchema(name: string): FlagSchema | null {
  return demoFlagSchemas[name] || null;
}

/**
 * List all available examples
 */
export function listExamples(): string[] {
  return Object.keys(exampleDialogues);
}

/**
 * List all available demo flag schemas
 */
export function listDemoFlagSchemas(): string[] {
  return Object.keys(demoFlagSchemas);
}

