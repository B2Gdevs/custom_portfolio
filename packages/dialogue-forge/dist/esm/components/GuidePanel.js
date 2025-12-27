import React, { useState } from 'react';
import { CodeBlock } from './CodeBlock';
export function GuidePanel({ isOpen, onClose }) {
    const [activeSection, setActiveSection] = useState('overview');
    if (!isOpen)
        return null;
    const sections = {
        overview: {
            title: 'Getting Started',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("p", null, "Dialogue Forge is a visual node-based editor for creating branching dialogue systems. Export to Yarn Spinner format for use in game engines."),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Node Types"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-[#e94560]" }, "NPC Node"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Character dialogue. Has speaker name, dialogue text, and one output port (bottom circle) that connects to the next node.")),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-purple-400" }, "Player Node"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Choice point with multiple options. Each choice has its own output port (right side circles) that can branch to different nodes."))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Basic Workflow"),
                React.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    React.createElement("li", null,
                        React.createElement("strong", null, "Create nodes"),
                        " - Right-click empty space or drag from output port"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Edit content"),
                        " - Click a node to edit in the side panel"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Connect nodes"),
                        " - Drag from output ports to connect"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Set flags"),
                        " - Add flags to track game state"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Export"),
                        " - Download Yarn file for your game")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Creating Nodes"),
                React.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2" },
                    React.createElement("li", null,
                        React.createElement("strong", null, "Right-click"),
                        " anywhere on the graph \u2192 Select \"NPC Node\" or \"Player Node\""),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Drag from output port"),
                        " \u2192 Release in empty space \u2192 Select node type from menu"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Right-click a node"),
                        " \u2192 \"Duplicate\" to copy it")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Editing Nodes"),
                React.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2" },
                    React.createElement("li", null,
                        React.createElement("strong", null, "Click a node"),
                        " to select it and open the editor panel"),
                    React.createElement("li", null, "Edit speaker, content, next node, and flags in the side panel"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Right-click a node"),
                        " for quick actions: Edit, Add Choice, Duplicate, Delete, Play from Here")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Connecting Nodes"),
                React.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2" },
                    React.createElement("li", null,
                        React.createElement("strong", null, "Drag from output port"),
                        " (circle at bottom of NPC or right of choice)"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Release on target node"),
                        " to connect directly"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Release in empty space"),
                        " to create a new connected node"),
                    React.createElement("li", null, "Each choice in a Player node can connect to different NPC nodes for branching"))))
        },
        flags: {
            title: 'Game State & Flags',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-[#e94560] p-4 rounded" },
                    React.createElement("h3", { className: "text-white font-semibold mb-2" }, "Game State & Yarn Variables"),
                    React.createElement("p", { className: "text-gray-300 text-xs mb-2" },
                        React.createElement("strong", null, "Dialogue Forge automatically flattens your game state into Yarn Spinner-compatible variables.")),
                    React.createElement("p", { className: "text-gray-400 text-xs mb-2" }, "Pass any JSON game state structure to ScenePlayer. Nested objects (player, characters, flags) are automatically flattened into flat variables that Yarn Spinner can use."),
                    React.createElement("p", { className: "text-gray-400 text-xs" },
                        "In Yarn Spinner, these become ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "$variable"),
                        " commands like ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<set $player_hp = 100>>"),
                        ".")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Game State Structure"),
                React.createElement("p", { className: "text-gray-400 mb-3" }, "Your game state can have any structure. Dialogue Forge supports nested objects and automatically flattens them:"),
                React.createElement(CodeBlock, { code: `// Example game state with nested structures
interface GameState {
  // Direct flags (optional, but recommended)
  flags?: {
    quest_dragon_slayer: 'not_started' | 'started' | 'complete';
    item_ancient_key: boolean;
  };
  
  // Player properties (flattened to $player_*)
  player?: {
    hp: number;
    maxHp: number;
    name: string;
    // Nested objects are flattened too
    affinity: {
      A: number;  // Becomes $player_affinity_A
      B: number;  // Becomes $player_affinity_B
    };
    elementAffinity: {
      fire: number;   // Becomes $player_elementAffinity_fire
      water: number;  // Becomes $player_elementAffinity_water
    };
  };
  
  // Characters as object (not array)
  characters?: {
    alice: { hp: 50, name: 'Alice' };  // Becomes $characters_alice_hp, $characters_alice_name
    bob: { hp: 30, name: 'Bob' };      // Becomes $characters_bob_hp, $characters_bob_name
  };
  
  // Any other game data
  inventory?: string[];
  location?: string;
}

const gameState: GameState = {
  flags: {
    quest_dragon_slayer: 'not_started',
    item_ancient_key: false,
  },
  player: {
    hp: 75,
    maxHp: 100,
    name: 'Hero',
    affinity: { A: 0.8, B: 0.5, C: 0.2 },
    elementAffinity: { fire: 0.9, water: 0.3 },
  },
  characters: {
    alice: { hp: 50, name: 'Alice' },
    bob: { hp: 30, name: 'Bob' },
  },
};`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Automatic Flattening"),
                React.createElement("p", { className: "text-gray-400 mb-3" }, "When you pass gameState to ScenePlayer, it's automatically flattened into Yarn-compatible variables:"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("p", { className: "text-gray-300 text-xs mb-2 font-semibold" }, "Flattening Rules:"),
                    React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs text-gray-400 ml-2" },
                        React.createElement("li", null,
                            React.createElement("strong", null, "Nested objects:"),
                            " ",
                            React.createElement("code", null, "player.hp"),
                            " \u2192 ",
                            React.createElement("code", null, "$player_hp")),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Deep nesting:"),
                            " ",
                            React.createElement("code", null, "player.affinity.A"),
                            " \u2192 ",
                            React.createElement("code", null, "$player_affinity_A")),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Object keys:"),
                            " ",
                            React.createElement("code", null, "characters.alice.hp"),
                            " \u2192 ",
                            React.createElement("code", null, "$characters_alice_hp")),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Arrays:"),
                            " ",
                            React.createElement("code", null, "inventory[0]"),
                            " \u2192 ",
                            React.createElement("code", null, "$inventory_0")),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Only truthy values:"),
                            " Skips 0, false, null, undefined, empty strings"),
                        React.createElement("li", null,
                            React.createElement("strong", null, "Yarn-compatible types:"),
                            " Only boolean, number, string (validated)"))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Using in Yarn Conditions"),
                React.createElement("p", { className: "text-gray-400 mb-3" }, "Flattened variables can be used in dialogue conditions:"),
                React.createElement(CodeBlock, { code: `// In your dialogue nodes, use flattened variable names:

// Check player HP
<<if $player_hp >= 50>>
  Merchant: "You look healthy!"
<<else>>
  Merchant: "You should rest..."
<<endif>>

// Check rune affinity
<<if $player_affinity_A > 0.7>>
  Wizard: "You have strong affinity with rune A!"
<<endif>>

// Check character status
<<if $characters_alice_hp < 20>>
  Healer: "Alice needs healing!"
<<endif>>

// Check element affinity
<<if $player_elementAffinity_fire > 0.8>>
  Fire Mage: "You're a natural with fire magic!"
<<endif>>`, language: "yarn" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Flag Schema (For Editor)"),
                React.createElement("p", { className: "text-gray-400 mb-3" },
                    "Flag Schema is used in the ",
                    React.createElement("strong", null, "editor"),
                    " for autocomplete and validation. It's separate from game state:"),
                React.createElement(CodeBlock, { code: `import { FlagSchema } from '@magicborn/dialogue-forge';

// Flag Schema helps the editor understand what flags exist
const flagSchema: FlagSchema = {
  flags: [
    {
      id: 'quest_dragon_slayer',
      name: 'Dragon Slayer Quest',
      type: 'quest',
      valueType: 'string',
      defaultValue: 'not_started'
    },
    {
      id: 'player_hp',  // Matches flattened game state
      name: 'Player HP',
      type: 'stat',
      valueType: 'number',
    },
    {
      id: 'player_affinity_A',  // Matches flattened game state
      name: 'Rune A Affinity',
      type: 'stat',
      valueType: 'number',
    },
  ]
};

// Use in editor for autocomplete
<DialogueEditorV2
  dialogue={dialogue}
  flagSchema={flagSchema}  // Helps with autocomplete
  onChange={...}
/>

// Game state is used in player
<ScenePlayer
  dialogue={dialogue}
  gameState={gameState}  // Full game state (automatically flattened)
  onComplete={...}
/>`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Flag Types"),
                React.createElement("div", { className: "space-y-2 text-sm" },
                    React.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-blue-400" }, "quest"),
                        " - Quest state (",
                        React.createElement("code", { className: "text-xs" }, "'not_started'"),
                        ", ",
                        React.createElement("code", { className: "text-xs" }, "'started'"),
                        ", ",
                        React.createElement("code", { className: "text-xs" }, "'complete'"),
                        ")"),
                    React.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-yellow-400" }, "achievement"),
                        " - Unlocked achievements (true/false)"),
                    React.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-green-400" }, "item"),
                        " - Inventory items (true/false or quantity)"),
                    React.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-purple-400" }, "stat"),
                        " - Player statistics (numbers: hp, gold, affinity, etc.)"),
                    React.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-pink-400" }, "title"),
                        " - Earned player titles (true/false)"),
                    React.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-gray-400" }, "dialogue"),
                        " - Temporary, dialogue-scoped flags")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Best Practices"),
                React.createElement("div", { className: "space-y-2 text-sm" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white text-xs" }, "1. Use descriptive names"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Flattened names should be clear: ",
                            React.createElement("code", null, "$player_hp"),
                            " not ",
                            React.createElement("code", null, "$p_h"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white text-xs" }, "2. Keep structures consistent"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Use the same game state structure throughout your app for predictable flattening")),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white text-xs" }, "3. Characters as objects, not arrays"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Use ",
                            React.createElement("code", null,
                                "characters: ",
                                '{',
                                " alice: ",
                                '{...}',
                                " ",
                                '}'),
                            " not ",
                            React.createElement("code", null, "characters: [alice, ...]"),
                            " for better naming")),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white text-xs" }, "4. Only truthy values are included"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Zero, false, null, undefined, and empty strings are automatically excluded from flattening")))))
        },
        integration: {
            title: 'Integration Guide',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("p", null, "How to integrate Dialogue Forge with your game."),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "1. Install Package"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("pre", { className: "text-xs font-mono text-gray-300" }, "npm install @magicborn/dialogue-forge")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "2. Define Flag Schema"),
                React.createElement(CodeBlock, { code: `import { FlagSchema } from '@magicborn/dialogue-forge';

const flagSchema: FlagSchema = {
  flags: [
    { id: 'quest_dragon_slayer', type: 'quest', valueType: 'string' },
    { id: 'item_ancient_key', type: 'item', valueType: 'boolean' },
    { id: 'stat_gold', type: 'stat', valueType: 'number', defaultValue: 0 },
  ]
};`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "3. Load Dialogue from Yarn"),
                React.createElement(CodeBlock, { code: `import { importFromYarn } from '@magicborn/dialogue-forge';

// Load Yarn file
const yarnContent = await loadFile('merchant.yarn');
const dialogue = importFromYarn(yarnContent, 'Merchant Dialogue');`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "4. Define Game State"),
                React.createElement("p", { className: "text-gray-400 text-sm mb-2" }, "Game state can be any JSON structure. Flags represent the dialogue-relevant portion."),
                React.createElement(CodeBlock, { code: `// Define your game state structure
interface GameState {
  flags: {
    quest_dragon_slayer: 'complete' | 'started' | 'not_started';
    item_ancient_key: boolean;
    stat_gold: number;
    stat_reputation: number;
  };
  player: {
    name: string;
    level: number;
    location: string;
  };
  // ... any other game data
}

// Initialize game state
const [gameState, setGameState] = useState<GameState>({
  flags: {
    quest_dragon_slayer: 'not_started',
    item_ancient_key: false,
    stat_gold: 1000,
    stat_reputation: 50,
  },
  player: {
    name: 'Hero',
    level: 5,
    location: 'town',
  },
});`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "5. Edit Dialogue"),
                React.createElement(CodeBlock, { code: `import { DialogueEditorV2, exportToYarn } from '@magicborn/dialogue-forge';

<DialogueEditorV2
  dialogue={dialogue}
  onChange={(updated) => {
    // Save edited dialogue
    const yarn = exportToYarn(updated);
    saveYarnFile(yarn);
  }}
  flagSchema={flagSchema}
  // Event hooks
  onNodeAdd={(node) => {/* Example: handle node add */}}
  onNodeDelete={(nodeId) => {/* Example: handle node delete */}}
  onConnect={(source, target) => {/* Example: handle connect */}}
/>`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "6. Define Game State"),
                React.createElement("p", { className: "text-gray-400 text-sm mb-2" }, "Game state can be any JSON object. Flags should represent the dialogue-relevant portion of your game state."),
                React.createElement(CodeBlock, { code: `// Example game state structure
interface GameState {
  flags: {
    quest_dragon_slayer: 'complete' | 'started' | 'not_started';
    item_ancient_key: boolean;
    stat_gold: number;
    stat_reputation: number;
  };
  player: {
    name: string;
    level: number;
    location: string;
  };
  inventory: string[];
  // ... any other game data
}

// Initialize game state
const gameState: GameState = {
  flags: {
    quest_dragon_slayer: 'not_started',
    item_ancient_key: false,
    stat_gold: 1000,
    stat_reputation: 50,
  },
  player: {
    name: 'Hero',
    level: 5,
    location: 'town',
  },
  inventory: ['sword', 'potion'],
};`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "7. Run Dialogue (Scene Player)"),
                React.createElement(CodeBlock, { code: `import { ScenePlayer } from '@magicborn/dialogue-forge';

<ScenePlayer
  dialogue={dialogue}
  gameState={gameState} // Pass full game state
  onComplete={(result) => {
    // Update game state with new flags
    setGameState(prev => ({
      ...prev,
      flags: {
        ...prev.flags,
        ...result.updatedFlags
      }
    }));
    
    // Now certain dialogues are locked/unlocked
    // based on the updated flags
  }}
  onFlagUpdate={(flags) => {
    // Real-time updates as dialogue progresses
    setGameState(prev => ({
      ...prev,
      flags: { ...prev.flags, ...flags }
    }));
  }}
  // Event hooks
  onNodeEnter={(nodeId, node) => {
    // Example: handle node enter
    // Trigger animations, sound effects, etc.
  }}
  onNodeExit={(nodeId, node) => {
    // Example: handle node exit
  }}
  onChoiceSelect={(nodeId, choice) => {
    // Example: handle choice select
    // Track player decisions
  }}
  onDialogueStart={() => {
    // Example: handle dialogue start
  }}
  onDialogueEnd={() => {
    // Example: handle dialogue end
  }}
/>`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Complete Example"),
                React.createElement(CodeBlock, { code: `import {
  DialogueEditorV2,
  ScenePlayer,
  importFromYarn,
  exportToYarn,
  FlagSchema
} from '@magicborn/dialogue-forge';

// 1. Define flag schema
const flagSchema: FlagSchema = {
  flags: [
    { id: 'quest_complete', type: 'quest', valueType: 'boolean' },
    { id: 'item_key', type: 'item', valueType: 'boolean' },
    { id: 'stat_gold', type: 'stat', valueType: 'number', defaultValue: 0 },
  ]
};

// 2. Define game state
interface GameState {
  flags: {
    quest_complete: boolean;
    item_key: boolean;
    stat_gold: number;
  };
  player: {
    name: string;
    level: number;
  };
}

const [gameState, setGameState] = useState<GameState>({
  flags: {
    quest_complete: false,
    item_key: false,
    stat_gold: 1000,
  },
  player: {
    name: 'Hero',
    level: 5,
  },
});

// 3. Load dialogue
const dialogue = importFromYarn(yarnFile, 'Merchant');

// 4. Edit dialogue with event hooks
<DialogueEditorV2
  dialogue={dialogue}
  onChange={(updated) => {
    const yarn = exportToYarn(updated);
    saveFile(yarn);
  }}
  flagSchema={flagSchema}
  // Event hooks
  onNodeAdd={(node) => {
    // Example: handle node add
    // Track node creation
  }}
  onNodeDelete={(nodeId) => {
    // Example: handle node delete
  }}
  onNodeUpdate={(nodeId, updates) => {
    // Example: handle node update
  }}
  onConnect={(sourceId, targetId, sourceHandle) => {
    // Example: handle connect
  }}
  onDisconnect={(edgeId, sourceId, targetId) => {
    // Example: handle disconnect
  }}
  onNodeSelect={(nodeId) => {
    // Example: handle node select
  }}
/>

// 5. Run dialogue with event hooks
<ScenePlayer
  dialogue={dialogue}
  gameState={gameState}
  onComplete={(result) => {
    // Update game state with new flags
    setGameState(prev => ({
      ...prev,
      flags: { ...prev.flags, ...result.updatedFlags }
    }));
  }}
  onNodeEnter={(nodeId, node) => {
    // Example: handle node enter
    // Play animations, sound effects
  }}
  onChoiceSelect={(nodeId, choice) => {
    // Example: handle choice select
    // Track player decisions
  }}
/>`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "How Flags Work with Unreal"),
                React.createElement("div", { className: "space-y-3 text-sm" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white" }, "1. Export to Yarn"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "When you export, flags become Yarn commands: ",
                            React.createElement("code", { className: "text-xs" }, "<<set $quest_dragon_slayer = \"started\">>"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white" }, "2. Import to Unreal"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Yarn Spinner loads the .yarn file and recognizes ",
                            React.createElement("code", { className: "text-xs" }, "$variable"),
                            " references. Variables are stored in Yarn Spinner's ",
                            React.createElement("strong", null, "Variable Storage"),
                            " component.")),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white" }, "3. Game Sets Variables"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Your Unreal code sets initial state: ",
                            React.createElement("code", { className: "text-xs" }, "VariableStorage->SetValue(\"quest_dragon_slayer\", \"not_started\")"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white" }, "4. Dialogue Reacts"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Yarn checks variables: ",
                            React.createElement("code", { className: "text-xs" }, "<<if $quest_dragon_slayer == \"started\">>"),
                            " reads from Variable Storage.")),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-white" }, "5. Dialogue Sets Variables"),
                        React.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "When dialogue runs ",
                            React.createElement("code", { className: "text-xs" }, "<<set $var>>"),
                            ", it updates Variable Storage. Your game can read these back."))),
                React.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-blue-500 p-4 rounded mt-4" },
                    React.createElement("p", { className: "text-gray-300 text-xs" },
                        React.createElement("strong", null, "Remember:"),
                        " Variables live in Yarn Spinner's Variable Storage at runtime, not in the .yarn file. The file only contains commands that manipulate the storage."))))
        },
        yarn: {
            title: 'Yarn Spinner',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("p", null, "Dialogue Forge exports to Yarn Spinner format for use in game engines like Unreal Engine."),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Basic Syntax"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: node_id
---
Speaker: Dialogue text here
<<set $flag_name = true>>
<<jump next_node_id>>
===`)),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Exporting"),
                React.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    React.createElement("li", null,
                        "Click the ",
                        React.createElement("strong", null, "Yarn"),
                        " tab (code icon) to see generated script"),
                    React.createElement("li", null,
                        "Click ",
                        React.createElement("strong", null, "\"Download .yarn\""),
                        " to save the file"),
                    React.createElement("li", null,
                        "Import the ",
                        React.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, ".yarn"),
                        " file into your game engine")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Importing"),
                React.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    React.createElement("li", null,
                        "Click the ",
                        React.createElement("strong", null, "Import"),
                        " button (upload icon)"),
                    React.createElement("li", null,
                        "Select a ",
                        React.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, ".yarn"),
                        " file"),
                    React.createElement("li", null, "Nodes are automatically created from the Yarn structure"),
                    React.createElement("li", null, "Edit visually, then export again")),
                React.createElement("p", { className: "text-gray-400 text-xs mt-3" },
                    React.createElement("strong", null, "Note:"),
                    " Flags are managed separately. Import/export flag schemas using the Flag Manager."),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "\u2705 Yarn Features Supported"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-green-400 text-xs" }, "Core Features"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                "Dialogue text with speakers (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "Speaker: Text"),
                                ")"),
                            React.createElement("li", null,
                                "Player choices (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "-> Choice text"),
                                ")"),
                            React.createElement("li", null,
                                "Node structure (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "title:"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "---"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "==="),
                                ")"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("strong", { className: "text-green-400 text-xs" }, "Commands"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                "Flag setting (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<set $flag = true>>"),
                                ")"),
                            React.createElement("li", null,
                                "Jumps (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<jump node_id>>"),
                                ")"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("strong", { className: "text-green-400 text-xs" }, "\u2705 Conditional Blocks (Full Support)"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<if condition>>"),
                                " - Conditional dialogue blocks"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<elseif condition>>"),
                                " - Alternative conditions"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<else>>"),
                                " - Default fallback"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<endif>>"),
                                " - End conditional block")),
                        React.createElement("p", { className: "text-gray-500 text-xs mt-2" }, "Supports nested conditionals in NPC nodes with multiple blocks")),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("strong", { className: "text-green-400 text-xs" }, "\u2705 Conditional Choices"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                "Choices can have conditions that wrap them in ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<if>>"),
                                " blocks"),
                            React.createElement("li", null, "Choices only appear when conditions are met"),
                            React.createElement("li", null, "Supports multiple conditions with AND logic"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("strong", { className: "text-green-400 text-xs" }, "\u2705 Condition Operators"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "is_set"),
                                " - Check if flag exists"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "is_not_set"),
                                " - Check if flag doesn't exist"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "=="),
                                " - Equals"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "!="),
                                " - Not equals"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, ">"),
                                " - Greater than"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<"),
                                " - Less than"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, ">="),
                                " - Greater or equal"),
                            React.createElement("li", null,
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<="),
                                " - Less or equal"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-yellow-500/30" },
                        React.createElement("strong", { className: "text-yellow-400 text-xs" }, "\u26A0\uFE0F Partially Supported"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                "Basic variable setting (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<set $flag = true>>"),
                                ") - Boolean only"),
                            React.createElement("li", null, "String/number variables - Not yet supported"),
                            React.createElement("li", null,
                                "Variable operations (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "+="),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "-="),
                                ", etc.) - Not yet supported"),
                            React.createElement("li", null,
                                "Variable references in text (",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" },
                                    "\"Hello ",
                                    '{$name}',
                                    "\""),
                                ") - Not yet supported"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-orange-500/30" },
                        React.createElement("strong", { className: "text-orange-400 text-xs" }, "\u274C Not Yet Supported"),
                        React.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-500" },
                            React.createElement("li", null,
                                React.createElement("strong", null, "Commands:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<wait 2>>"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<stop>>"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<command param>>")),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Detour:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<detour node_id>>"),
                                " (temporary jump with return)"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Once:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<once>>"),
                                " (options appear only once)"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Shortcuts:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "[[text|node]]"),
                                " (inline navigation)"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Tags:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "#tag"),
                                " (node metadata)"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Node Headers:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "color:"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "group:"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "style: note")),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Functions:"),
                                " ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "visited(\"node_id\")"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "random(min, max)"),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "dice(sides)")),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Line Groups:"),
                                " Random/sequential line selection"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Smart Variables:"),
                                " Auto-incrementing, dependencies"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Enums:"),
                                " Enum type support"))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-blue-500/30 mt-3" },
                        React.createElement("strong", { className: "text-blue-400 text-xs" }, "\uD83D\uDCCB Yarn Spinner Feature Roadmap"),
                        React.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "We're actively working on full Yarn Spinner compatibility. Next priorities:"),
                        React.createElement("ol", { className: "list-decimal list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            React.createElement("li", null,
                                React.createElement("strong", null, "Full Variable System"),
                                " - String, number, boolean variables with operations"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Advanced Set Operations"),
                                " - ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "+="),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "-="),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "*="),
                                ", ",
                                React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "/=")),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Rebuild PlayView"),
                                " - Proper Yarn Spinner execution engine"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Commands & Shortcuts"),
                                " - wait, stop, detour, once, [[text|node]]"),
                            React.createElement("li", null,
                                React.createElement("strong", null, "Functions & Tags"),
                                " - visited(), random(), #tags, node headers")),
                        React.createElement("p", { className: "text-xs text-gray-500 mt-2 italic" }, "See the Roadmap section for detailed implementation plans."))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Conditional Dialogue with If/Elseif/Else"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: merchant_greeting
---
<<if $quest_dragon_slayer == "complete">>
    Merchant: "Thank you for slaying the dragon! Here's your reward."
    <<set $stat_gold += 500>>
    <<set $achievement_dragon_slayer = true>>
<<elseif $quest_dragon_slayer == "started">>
    Merchant: "How goes the quest? I heard the dragon is still alive."
<<elseif $stat_reputation >= 50>>
    Merchant: "Welcome, honored traveler. I've heard good things about you."
<<else>>
    Merchant: "Welcome, traveler. What can I do for you?"
<<endif>>
<<jump merchant_shop>>
===`),
                    React.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "This example shows multiple conditions: first checks if quest is complete, then if started, then if reputation is high enough, otherwise shows default greeting.")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Conditional Choices"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: guard_checkpoint
---
Guard: You're not allowed in!
-> Sure I am! The boss knows me! <<if $reputation > 10>>
    <<jump allowed_in>>
-> Please?
    <<jump begging>>
-> I'll come back later.
    <<jump leave>>
===`),
                    React.createElement("p", { className: "text-xs text-gray-400 mt-2" },
                        "The first choice only appears if ",
                        React.createElement("code", { className: "text-xs" }, "$reputation > 10"),
                        ". Other choices always show.")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Conditional Choices with Multiple Conditions"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: merchant_shop
---
Merchant: What would you like to buy?
-> "Buy the sword" <<if $stat_gold >= 100 and $reputation >= 20>>
    <<set $item_sword = true>>
    <<set $stat_gold -= 100>>
    <<jump purchase_complete>>
-> "Buy the potion" <<if $stat_gold >= 50>>
    <<set $item_potion = true>>
    <<set $stat_gold -= 50>>
    <<jump purchase_complete>>
-> "I'll come back later"
    <<jump leave>>
===`),
                    React.createElement("p", { className: "text-xs text-gray-400 mt-2" },
                        "Use ",
                        React.createElement("code", { className: "text-xs" }, "and"),
                        " to combine multiple conditions. Choices only appear when all conditions are met.")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Code Example"),
                React.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    React.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { importFromYarn, exportToYarn } from '@magicborn/dialogue-forge';

// Import existing Yarn file
const yarnContent = await fetch('dialogue.yarn').then(r => r.text());
const dialogue = importFromYarn(yarnContent, 'My Dialogue');

// Edit it...

// Export back to Yarn
const newYarn = exportToYarn(dialogue);
await saveFile('dialogue.yarn', newYarn);`))))
        },
        shortcuts: {
            title: 'Keyboard Shortcuts',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("ul", { className: "space-y-2" },
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Ctrl+Z"),
                        React.createElement("span", { className: "text-gray-400" }, "Undo last action (Cmd+Z on Mac)")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Ctrl+Y"),
                        React.createElement("span", { className: "text-gray-400" }, "Redo last action (Cmd+Y on Mac)")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Delete"),
                        React.createElement("span", { className: "text-gray-400" }, "Delete selected node(s) or edge(s)")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Escape"),
                        React.createElement("span", { className: "text-gray-400" }, "Close menus, deselect node")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Right-click"),
                        React.createElement("span", { className: "text-gray-400" }, "Context menu (on graph or node)")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Scroll"),
                        React.createElement("span", { className: "text-gray-400" }, "Zoom in/out on graph")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Drag"),
                        React.createElement("span", { className: "text-gray-400" }, "Pan the graph view (middle mouse or space + drag)")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Drag node"),
                        React.createElement("span", { className: "text-gray-400" }, "Move node position")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Drag port"),
                        React.createElement("span", { className: "text-gray-400" }, "Create connection to another node")),
                    React.createElement("li", { className: "flex items-start gap-2" },
                        React.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Click + Drag"),
                        React.createElement("span", { className: "text-gray-400" }, "Select multiple nodes (selection box)")))))
        },
        roadmap: {
            title: 'Roadmap & Issues',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-yellow-500 p-4 rounded mb-4" },
                    React.createElement("p", { className: "text-gray-300 text-xs mb-2" }, "This section tracks what we're working on and known issues. Check back for updates!"),
                    React.createElement("p", { className: "text-gray-400 text-xs" },
                        React.createElement("strong", null, "Note:"),
                        " For best experience, consider using the editor and simulator as separate pages in your application. The current embedded view may have scroll limitations.")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "\u2705 Recently Completed"),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "React Flow Migration"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Complete rewrite using React Flow with custom nodes, edges, and improved UX")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Undo/Redo System"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Action history with Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Y (React Flow built-in)")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Multi-Select & Delete"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Selection box to select multiple nodes, bulk delete with Delete key (known issue: square selection doesn't always capture all nodes - deprioritized)")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Minimap"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Graph overview with navigation (React Flow built-in)")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Edge Hover & Deletion"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Edges highlight on hover and can be deleted by selecting and pressing Delete"))))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "In Progress"),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-yellow-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-yellow-500 text-xs" }, "\uD83D\uDD04"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Enhanced Yarn Spinner Support"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Adding more Yarn Spinner features and improving graph node functionality"))))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Planned (High Priority)"),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Copy/Paste"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Copy selected nodes and paste with offset, duplicate nodes with connections")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Variables System"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Full Yarn variable support with UI for variable management")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Node Search/Filter"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Search nodes by ID, content, or flags used"))))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Planned (Medium Priority)"),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Advanced Set Operations"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Increment, decrement, multiply, divide for variables")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Commands Support"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Yarn Spinner command nodes with parameters")))),
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Node Alignment Tools"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Align, distribute, and snap to grid"))))),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Known Issues"),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-orange-500/30" },
                        React.createElement("div", { className: "flex items-start gap-2" },
                            React.createElement("span", { className: "text-orange-500 text-xs" }, "\u26A0\uFE0F"),
                            React.createElement("div", null,
                                React.createElement("strong", { className: "text-white text-xs" }, "Square Selection"),
                                React.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Selection box doesn't always capture all nodes within the selection area (deprioritized)")))))))
        },
        characters: {
            title: 'Characters',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("p", { className: "text-gray-300" }, "Dialogue Forge supports character assignment for NPC and Player nodes. Characters are defined in your game state and can be selected from a searchable dropdown."),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Character System"),
                React.createElement("p", { className: "text-gray-300 mb-3" }, "Each node (NPC or Player) can be assigned a character from your game state. When a character is assigned:"),
                React.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2 text-gray-300" },
                    React.createElement("li", null, "The character's avatar and name are displayed on the node in the graph"),
                    React.createElement("li", null, "The character name is used as the speaker name"),
                    React.createElement("li", null, "You can still override with a custom speaker name if needed")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Game State Structure"),
                React.createElement("p", { className: "text-gray-300 mb-3" },
                    "Characters should be defined in your game state under the ",
                    React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "characters"),
                    " property:"),
                React.createElement(CodeBlock, { code: `interface GameState {
  flags?: FlagState;
  characters?: {
    [characterId: string]: Character;
  };
}

interface Character {
  id: string;
  name: string;
  avatar?: string; // URL or emoji (e.g., "👤", "🧙", "/avatars/wizard.png")
  description?: string;
}`, language: "typescript" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Using Characters"),
                React.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2 text-gray-300" },
                    React.createElement("li", null,
                        React.createElement("strong", null, "Define characters"),
                        " in your game state with ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "id"),
                        ", ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "name"),
                        ", and optionally ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "avatar")),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Pass characters"),
                        " to ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "DialogueEditorV2"),
                        " via the ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "characters"),
                        " prop"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "Select a character"),
                        " in the Node Editor using the character dropdown (searchable combobox)"),
                    React.createElement("li", null,
                        React.createElement("strong", null, "View on graph"),
                        " - The character's avatar and name appear on the node")),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example"),
                React.createElement(CodeBlock, { code: `// Game state with characters
const gameState = {
  flags: { reputation: 50 },
  characters: {
    stranger: {
      id: 'stranger',
      name: 'Mysterious Stranger',
      avatar: '👤',
      description: 'A cloaked figure'
    },
    player: {
      id: 'player',
      name: 'Player',
      avatar: '🎮',
      description: 'The player character'
    }
  }
};

// Pass to DialogueEditorV2
<DialogueEditorV2
  dialogue={dialogueTree}
  characters={gameState.characters}
  flagSchema={flagSchema}
  onChange={setDialogueTree}
/>`, language: "typescript" }),
                React.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-blue-500 p-4 rounded mt-4" },
                    React.createElement("p", { className: "text-gray-300 text-xs" },
                        React.createElement("strong", null, "Note:"),
                        " If a character is not assigned, you can still use a custom speaker name. The character system is optional but recommended for consistency across your dialogue system."))))
        },
        theming: {
            title: 'Theming',
            content: (React.createElement("div", { className: "space-y-4 text-sm" },
                React.createElement("p", { className: "text-gray-300" },
                    "Dialogue Forge uses Tailwind CSS theme variables that you can override in your application. All theme variables are prefixed with ",
                    React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "df-"),
                    " to avoid conflicts."),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "How to Override Theme"),
                React.createElement("p", { className: "text-gray-300 mb-3" }, "Copy the theme variables below into your CSS file and override the values you want to change:"),
                React.createElement(CodeBlock, { code: `@theme {
  /* Base Colors */
  --color-df-base: oklch(0.15 0.02 250);
  --color-df-surface: oklch(0.18 0.02 260);
  --color-df-elevated: oklch(0.22 0.02 270);
  
  /* NPC Node Colors */
  --color-df-npc-bg: oklch(0.25 0.04 45);
  --color-df-npc-border: oklch(0.40 0.08 35);
  --color-df-npc-header: oklch(0.30 0.10 25);
  --color-df-npc-selected: oklch(0.45 0.12 15);
  
  /* Player Node Colors */
  --color-df-player-bg: oklch(0.22 0.08 300);
  --color-df-player-border: oklch(0.45 0.15 310);
  --color-df-player-header: oklch(0.28 0.12 290);
  --color-df-player-selected: oklch(0.55 0.20 280);
  
  /* Conditional Node */
  --color-df-conditional-bg: oklch(0.24 0.06 150);
  --color-df-conditional-border: oklch(0.42 0.12 140);
  --color-df-conditional-header: oklch(0.30 0.10 145);
  
  /* Start/End */
  --color-df-start: oklch(0.55 0.15 140);
  --color-df-start-bg: oklch(0.25 0.08 140);
  --color-df-end: oklch(0.50 0.15 45);
  --color-df-end-bg: oklch(0.25 0.08 45);
  
  /* Edges */
  --color-df-edge-default: oklch(0.40 0.03 250);
  --color-df-edge-default-hover: oklch(0.50 0.05 250);
  --color-df-edge-choice-1: oklch(0.50 0.18 15);
  --color-df-edge-choice-2: oklch(0.55 0.20 280);
  --color-df-edge-choice-3: oklch(0.52 0.18 200);
  --color-df-edge-choice-4: oklch(0.58 0.16 120);
  --color-df-edge-choice-5: oklch(0.50 0.15 45);
  --color-df-edge-loop: oklch(0.55 0.15 60);
  --color-df-edge-dimmed: oklch(0.25 0.02 250);
  
  /* Status Colors */
  --color-df-error: oklch(0.55 0.22 25);
  --color-df-warning: oklch(0.65 0.18 70);
  --color-df-success: oklch(0.60 0.18 150);
  --color-df-info: oklch(0.55 0.15 220);
  
  /* Text Colors */
  --color-df-text-primary: oklch(0.85 0.02 250);
  --color-df-text-secondary: oklch(0.65 0.02 250);
  --color-df-text-tertiary: oklch(0.45 0.02 250);
  
  /* UI Control Colors */
  --color-df-control-bg: oklch(0.18 0.02 260);
  --color-df-control-border: oklch(0.30 0.03 250);
  --color-df-control-hover: oklch(0.25 0.03 250);
  
  /* Flag Colors */
  --color-df-flag-dialogue: oklch(0.45 0.03 250);
  --color-df-flag-dialogue-bg: oklch(0.20 0.02 250);
  --color-df-flag-quest: oklch(0.50 0.15 220);
  --color-df-flag-quest-bg: oklch(0.22 0.08 220);
  --color-df-flag-achievement: oklch(0.60 0.18 70);
  --color-df-flag-achievement-bg: oklch(0.25 0.10 70);
  --color-df-flag-item: oklch(0.55 0.15 150);
  --color-df-flag-item-bg: oklch(0.25 0.08 150);
  --color-df-flag-stat: oklch(0.55 0.18 280);
  --color-df-flag-stat-bg: oklch(0.25 0.10 280);
  --color-df-flag-title: oklch(0.55 0.18 330);
  --color-df-flag-title-bg: oklch(0.25 0.10 330);
  --color-df-flag-global: oklch(0.50 0.15 45);
  --color-df-flag-global-bg: oklch(0.25 0.08 45);
  
  /* Canvas/Background */
  --color-df-canvas-bg: oklch(0.12 0.01 250);
  --color-df-canvas-grid: oklch(0.20 0.02 250);
  
  /* Sidebar/Editor */
  --color-df-sidebar-bg: oklch(0.18 0.02 260);
  --color-df-sidebar-border: oklch(0.35 0.05 250);
  --color-df-editor-bg: oklch(0.15 0.02 240);
  --color-df-editor-border: oklch(0.30 0.03 250);
}`, language: "css" }),
                React.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Custom Blue Theme"),
                React.createElement(CodeBlock, { code: `@theme {
  /* Override NPC colors to blue */
  --color-df-npc-bg: oklch(0.25 0.08 220);
  --color-df-npc-border: oklch(0.50 0.15 220);
  --color-df-npc-selected: oklch(0.60 0.20 220);
  
  /* Override player colors to purple */
  --color-df-player-bg: oklch(0.25 0.10 300);
  --color-df-player-border: oklch(0.55 0.20 300);
  --color-df-player-selected: oklch(0.65 0.25 300);
}`, language: "css" }),
                React.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-blue-500 p-4 rounded mt-4" },
                    React.createElement("p", { className: "text-gray-300 text-xs" },
                        React.createElement("strong", null, "Note:"),
                        " All Dialogue Forge components use these theme classes (e.g., ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "bg-df-npc-bg"),
                        ", ",
                        React.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "text-df-text-primary"),
                        "). By overriding the CSS variables, you change the colors throughout the entire editor without modifying any component code."))))
        }
    };
    return (React.createElement("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", onClick: onClose },
        React.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex", onClick: (e) => e.stopPropagation() },
            React.createElement("div", { className: "w-64 border-r border-[#1a1a2e] bg-[#12121a] flex flex-col" },
                React.createElement("div", { className: "p-4 border-b border-[#1a1a2e]" },
                    React.createElement("h2", { className: "text-lg font-semibold text-white" }, "Guide")),
                React.createElement("nav", { className: "flex-1 overflow-y-auto p-2" }, Object.entries(sections).map(([key, section]) => (React.createElement("button", { key: key, onClick: () => setActiveSection(key), className: `w-full text-left px-3 py-2 rounded text-sm transition-colors mb-1 ${activeSection === key
                        ? 'bg-[#e94560] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a1a2e]'}` }, section.title))))),
            React.createElement("div", { className: "flex-1 overflow-y-auto p-6" },
                React.createElement("div", { className: "max-w-none" },
                    React.createElement("h1", { className: "text-2xl font-bold text-white mb-4" }, sections[activeSection].title),
                    React.createElement("div", { className: "text-gray-300" }, sections[activeSection].content))),
            React.createElement("button", { onClick: onClose, className: "absolute top-4 right-4 p-2 text-gray-400 hover:text-white" },
                React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                    React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))))));
}
