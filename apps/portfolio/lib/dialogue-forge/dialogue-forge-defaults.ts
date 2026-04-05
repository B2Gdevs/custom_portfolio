import type { DialogueTree } from '@magicborn/dialogue-forge/src/types';

/** Seed graph for first visit (persisted state overrides). */
export const DEFAULT_DIALOGUE_TREE: DialogueTree = {
  id: 'example-dialogue',
  title: 'Example: The Mysterious Stranger',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      type: 'npc',
      speaker: 'Stranger',
      x: 300,
      y: 100,
      content: 'You find yourself at a crossroads. A cloaked figure emerges from the shadows.',
      nextNodeId: 'greeting',
      setFlags: ['dialogue_met_stranger'],
    },
    greeting: {
      id: 'greeting',
      type: 'npc',
      speaker: 'Stranger',
      x: 300,
      y: 200,
      content: `"Traveler... I've been waiting for you. What brings you to these lands?"`,
      nextNodeId: 'first_choice',
    },
    first_choice: {
      id: 'first_choice',
      type: 'player',
      content: '',
      x: 300,
      y: 300,
      choices: [
        {
          id: 'choice_treasure',
          text: 'I seek the legendary treasure.',
          nextNodeId: 'treasure_response',
          setFlags: ['quest_dragon_slayer'],
        },
        {
          id: 'choice_knowledge',
          text: "I'm searching for ancient knowledge.",
          nextNodeId: 'knowledge_response',
          setFlags: ['dialogue_seeks_knowledge'],
        },
        {
          id: 'choice_hostile',
          text: "That's none of your business.",
          nextNodeId: 'hostile_response',
          setFlags: ['dialogue_hostile'],
        },
      ],
    },
    treasure_response: {
      id: 'treasure_response',
      type: 'npc',
      speaker: 'Stranger',
      x: 100,
      y: 450,
      content:
        '"Many have sought the same. Take this map—it shows the entrance to the catacombs."',
      setFlags: ['item_ancient_key'],
      nextNodeId: 'second_choice',
    },
    knowledge_response: {
      id: 'knowledge_response',
      type: 'npc',
      speaker: 'Stranger',
      x: 300,
      y: 450,
      content: '"A seeker of truth... Take this tome. It contains the riddles you must solve."',
      setFlags: ['item_ancient_key'],
      nextNodeId: 'second_choice',
    },
    hostile_response: {
      id: 'hostile_response',
      type: 'npc',
      speaker: 'Stranger',
      x: 500,
      y: 450,
      content: '"Very well. Walk your path alone."',
      nextNodeId: 'hostile_choice',
    },
    hostile_choice: {
      id: 'hostile_choice',
      type: 'player',
      content: '',
      x: 500,
      y: 600,
      choices: [
        {
          id: 'apologize',
          text: 'Wait—I apologize. These roads have made me wary.',
          nextNodeId: 'apology_response',
        },
        {
          id: 'leave',
          text: "I don't need your help. *walk away*",
          nextNodeId: 'leave_ending',
        },
      ],
    },
    apology_response: {
      id: 'apology_response',
      type: 'npc',
      speaker: 'Stranger',
      x: 400,
      y: 750,
      content:
        '"Humility... perhaps there is hope for you yet. Tell me, what do you truly seek?"',
      nextNodeId: 'first_choice',
    },
    leave_ending: {
      id: 'leave_ending',
      type: 'npc',
      speaker: 'Narrator',
      x: 600,
      y: 750,
      content:
        'You turn and walk away into the mist. Whatever secrets they held are lost to you now.\n\n— END —',
    },
    second_choice: {
      id: 'second_choice',
      type: 'player',
      content: '',
      x: 200,
      y: 600,
      choices: [
        {
          id: 'ask_danger',
          text: 'What dangers await me on this path?',
          nextNodeId: 'danger_info',
        },
        {
          id: 'ask_stranger',
          text: 'Who are you? Why do you help travelers?',
          nextNodeId: 'stranger_reveal',
        },
        {
          id: 'thank_leave',
          text: 'Thank you. I should be on my way.',
          nextNodeId: 'depart_response',
        },
      ],
    },
    danger_info: {
      id: 'danger_info',
      type: 'npc',
      speaker: 'Stranger',
      x: 50,
      y: 800,
      content:
        '"The forest is home to creatures that fear no blade. Beyond it, the ruins are patrolled by the Hollow."',
      nextNodeId: 'final_choice',
    },
    stranger_reveal: {
      id: 'stranger_reveal',
      type: 'npc',
      speaker: 'Stranger',
      x: 200,
      y: 800,
      content:
        'The stranger pulls back their hood, revealing an ageless face marked with glowing runes. "I am the last of the Keepers."',
      setFlags: ['achievement_first_quest', 'stat_reputation'],
      nextNodeId: 'final_choice',
    },
    depart_response: {
      id: 'depart_response',
      type: 'npc',
      speaker: 'Stranger',
      x: 300,
      y: 800,
      content: '"May the old gods watch over you, traveler."\n\n— TO BE CONTINUED —',
    },
    final_choice: {
      id: 'final_choice',
      type: 'player',
      content: '',
      x: 125,
      y: 950,
      choices: [
        {
          id: 'ready',
          text: "I'm ready. Point me to the path.",
          nextNodeId: 'depart_response',
        },
        {
          id: 'more_questions',
          text: 'I have more questions...',
          nextNodeId: 'second_choice',
        },
      ],
    },
  },
};
