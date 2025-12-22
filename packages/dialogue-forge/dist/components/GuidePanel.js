"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuidePanel = GuidePanel;
const react_1 = __importStar(require("react"));
function GuidePanel({ isOpen, onClose }) {
    const [activeSection, setActiveSection] = (0, react_1.useState)('overview');
    if (!isOpen)
        return null;
    const sections = {
        overview: {
            title: 'Getting Started',
            content: (react_1.default.createElement("div", { className: "space-y-4 text-sm" },
                react_1.default.createElement("p", null, "Dialogue Forge is a visual node-based editor for creating branching dialogue systems. Export to Yarn Spinner format for use in game engines."),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Node Types"),
                react_1.default.createElement("div", { className: "space-y-3" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-[#e94560]" }, "NPC Node"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Character dialogue. Has speaker name, dialogue text, and one output port (bottom circle) that connects to the next node.")),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-purple-400" }, "Player Node"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Choice point with multiple options. Each choice has its own output port (right side circles) that can branch to different nodes."))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Basic Workflow"),
                react_1.default.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Create nodes"),
                        " - Right-click empty space or drag from output port"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Edit content"),
                        " - Click a node to edit in the side panel"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Connect nodes"),
                        " - Drag from output ports to connect"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Set flags"),
                        " - Add flags to track game state"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Export"),
                        " - Download Yarn file for your game")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Creating Nodes"),
                react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Right-click"),
                        " anywhere on the graph \u2192 Select \"NPC Node\" or \"Player Node\""),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Drag from output port"),
                        " \u2192 Release in empty space \u2192 Select node type from menu"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Right-click a node"),
                        " \u2192 \"Duplicate\" to copy it")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Editing Nodes"),
                react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Click a node"),
                        " to select it and open the editor panel"),
                    react_1.default.createElement("li", null, "Edit speaker, content, next node, and flags in the side panel"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Right-click a node"),
                        " for quick actions: Edit, Add Choice, Duplicate, Delete, Play from Here")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Connecting Nodes"),
                react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Drag from output port"),
                        " (circle at bottom of NPC or right of choice)"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Release on target node"),
                        " to connect directly"),
                    react_1.default.createElement("li", null,
                        react_1.default.createElement("strong", null, "Release in empty space"),
                        " to create a new connected node"),
                    react_1.default.createElement("li", null, "Each choice in a Player node can connect to different NPC nodes for branching"))))
        },
        flags: {
            title: 'Flags & Yarn Variables',
            content: (react_1.default.createElement("div", { className: "space-y-4 text-sm" },
                react_1.default.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-[#e94560] p-4 rounded" },
                    react_1.default.createElement("h3", { className: "text-white font-semibold mb-2" }, "How Flags Work"),
                    react_1.default.createElement("p", { className: "text-gray-300 text-xs mb-2" },
                        react_1.default.createElement("strong", null, "Flags are passed into the editor and used in the simulator.")),
                    react_1.default.createElement("p", { className: "text-gray-400 text-xs mb-2" }, "Flags can be set during dialogue, which affects the state during simulation. Flags are exported/imported separately from dialogue."),
                    react_1.default.createElement("p", { className: "text-gray-400 text-xs" },
                        "In Yarn Spinner, flags become ",
                        react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "$variable"),
                        " commands like ",
                        react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<set $flag = value>>"),
                        ".")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "What Are Flags?"),
                react_1.default.createElement("p", { className: "text-gray-400" }, "Flags are variables that track what's happened in your game. Examples:"),
                react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-sm ml-2 text-gray-400" },
                    react_1.default.createElement("li", null,
                        "Quest completed: ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, "quest_dragon_slayer = \"complete\"")),
                    react_1.default.createElement("li", null,
                        "Has item: ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, "item_ancient_key = true")),
                    react_1.default.createElement("li", null,
                        "Player reputation: ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, "stat_reputation = 50")),
                    react_1.default.createElement("li", null,
                        "Achievement unlocked: ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, "achievement_first_quest = true"))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Setting Up Flags"),
                react_1.default.createElement("p", { className: "text-gray-400 mb-3" }, "Define your flags in code and pass them to the editor:"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { FlagSchema } from '@portfolio/dialogue-forge';

const flagSchema: FlagSchema = {
  categories: ['quests', 'items', 'stats', 'achievements'],
  flags: [
    // Quest flags
    {
      id: 'quest_dragon_slayer',
      name: 'Dragon Slayer Quest',
      type: 'quest',
      category: 'quests',
      valueType: 'string',
      defaultValue: 'not_started'
    },
    {
      id: 'quest_dragon_slayer_complete',
      name: 'Dragon Slayer Complete',
      type: 'quest',
      category: 'quests'
    },
    
    // Item flags
    {
      id: 'item_ancient_key',
      name: 'Ancient Key',
      type: 'item',
      category: 'items'
    },
    
    // Stat flags
    {
      id: 'stat_gold',
      name: 'Gold',
      type: 'stat',
      category: 'stats',
      valueType: 'number',
      defaultValue: 0
    },
    {
      id: 'stat_reputation',
      name: 'Reputation',
      type: 'stat',
      category: 'stats',
      valueType: 'number',
      defaultValue: 0
    },
    
    // Achievement flags
    {
      id: 'achievement_first_quest',
      name: 'First Quest',
      type: 'achievement',
      category: 'achievements'
    }
  ]
};`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Flag Types"),
                react_1.default.createElement("div", { className: "space-y-2 text-sm" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-blue-400" }, "quest"),
                        " - Quest state (",
                        react_1.default.createElement("code", { className: "text-xs" }, "'not_started'"),
                        ", ",
                        react_1.default.createElement("code", { className: "text-xs" }, "'in_progress'"),
                        ", ",
                        react_1.default.createElement("code", { className: "text-xs" }, "'complete'"),
                        ")"),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-yellow-400" }, "achievement"),
                        " - Unlocked achievements (true/false)"),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-green-400" }, "item"),
                        " - Inventory items (true/false or quantity)"),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-purple-400" }, "stat"),
                        " - Player statistics (numbers: gold, reputation, etc.)"),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-pink-400" }, "title"),
                        " - Earned player titles (true/false)"),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-gray-400" }, "dialogue"),
                        " - Temporary, dialogue-scoped flags"),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-2 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-gray-400" }, "global"),
                        " - Global game state")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Using Flags in Editor"),
                react_1.default.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        "Pass ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, "flagSchema"),
                        " to the editor"),
                    react_1.default.createElement("li", null,
                        "When setting flags, ",
                        react_1.default.createElement("strong", null, "type to see matching flags"),
                        " in the dropdown"),
                    react_1.default.createElement("li", null, "Click a flag to add it (organized by category)"),
                    react_1.default.createElement("li", null,
                        "Flags are exported to Yarn as ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, "<<set $flag_name = true>>"))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Flag Naming Convention"),
                react_1.default.createElement("p", { className: "text-gray-400 text-xs" }, "Use prefixes to organize flags:"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e] text-xs font-mono space-y-1" },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("code", { className: "text-blue-400" }, "quest_*"),
                        " - Quest-related flags"),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("code", { className: "text-yellow-400" }, "achievement_*"),
                        " - Achievements"),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("code", { className: "text-green-400" }, "item_*"),
                        " - Items"),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("code", { className: "text-purple-400" }, "stat_*"),
                        " - Statistics"),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("code", { className: "text-pink-400" }, "title_*"),
                        " - Titles"),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("code", { className: "text-gray-400" }, "dialogue_*"),
                        " - Dialogue-scoped (temporary)"))))
        },
        integration: {
            title: 'Integration Guide',
            content: (react_1.default.createElement("div", { className: "space-y-4 text-sm" },
                react_1.default.createElement("p", null, "How to integrate Dialogue Forge with your game."),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "1. Install Package"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300" }, "npm install @portfolio/dialogue-forge")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "2. Define Flag Schema"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { FlagSchema } from '@portfolio/dialogue-forge';

const flagSchema: FlagSchema = {
  flags: [
    { id: 'quest_dragon_slayer', type: 'quest', category: 'quests' },
    { id: 'item_ancient_key', type: 'item', category: 'items' },
    { id: 'stat_gold', type: 'stat', category: 'stats', valueType: 'number' },
  ]
};`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "3. Load Dialogue from Yarn"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { importFromYarn } from '@portfolio/dialogue-forge';

// Load Yarn file
const yarnContent = await loadFile('merchant.yarn');
const dialogue = importFromYarn(yarnContent, 'Merchant Dialogue');`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "4. Get Current Game Flags"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `// Get current player state
const currentFlags = {
  quest_dragon_slayer: 'complete',
  item_ancient_key: true,
  stat_gold: 1000,
  stat_reputation: 50
};`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "5. Edit Dialogue"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { DialogueEditor, exportToYarn } from '@portfolio/dialogue-forge';

<DialogueEditor
  dialogue={dialogue}
  onChange={(updated) => {
    // Save edited dialogue
    const yarn = exportToYarn(updated);
    saveYarnFile(yarn);
  }}
  flagSchema={flagSchema}
  initialFlags={currentFlags}
/>`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "6. Run Dialogue (Simulation)"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { DialogueSimulator } from '@portfolio/dialogue-forge';

<DialogueSimulator
  dialogue={dialogue}
  initialFlags={currentFlags}
  onComplete={(result) => {
    // Update game state with new flags
    gameState.flags = {
      ...gameState.flags,
      ...result.updatedFlags
    };
    
    // Now certain dialogues are locked/unlocked
    // based on the updated flags
  }}
  onFlagUpdate={(flags) => {
    // Real-time updates as dialogue progresses
  }}
/>`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Complete Example"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import {
  DialogueEditor,
  DialogueSimulator,
  importFromYarn,
  exportToYarn,
  FlagSchema
} from '@portfolio/dialogue-forge';

// 1. Define flags
const flagSchema: FlagSchema = {
  flags: [
    { id: 'quest_complete', type: 'quest' },
    { id: 'item_key', type: 'item' },
  ]
};

// 2. Load dialogue
const dialogue = importFromYarn(yarnFile, 'Merchant');

// 3. Get game state
const gameFlags = {
  quest_complete: true,
  item_key: false
};

// 4. Edit or run dialogue
<DialogueEditor
  dialogue={dialogue}
  onChange={(updated) => {
    const yarn = exportToYarn(updated);
    saveFile(yarn);
  }}
  flagSchema={flagSchema}
  initialFlags={gameFlags}
/>

// OR run it:
<DialogueSimulator
  dialogue={dialogue}
  initialFlags={gameFlags}
  onComplete={(result) => {
    // Update game with new flags
    gameState.flags = result.updatedFlags;
  }}
/>`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "How Flags Work with Unreal"),
                react_1.default.createElement("div", { className: "space-y-3 text-sm" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-white" }, "1. Export to Yarn"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "When you export, flags become Yarn commands: ",
                            react_1.default.createElement("code", { className: "text-xs" }, "<<set $quest_dragon_slayer = \"started\">>"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-white" }, "2. Import to Unreal"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Yarn Spinner loads the .yarn file and recognizes ",
                            react_1.default.createElement("code", { className: "text-xs" }, "$variable"),
                            " references. Variables are stored in Yarn Spinner's ",
                            react_1.default.createElement("strong", null, "Variable Storage"),
                            " component.")),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-white" }, "3. Game Sets Variables"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Your Unreal code sets initial state: ",
                            react_1.default.createElement("code", { className: "text-xs" }, "VariableStorage->SetValue(\"quest_dragon_slayer\", \"not_started\")"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-white" }, "4. Dialogue Reacts"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "Yarn checks variables: ",
                            react_1.default.createElement("code", { className: "text-xs" }, "<<if $quest_dragon_slayer == \"started\">>"),
                            " reads from Variable Storage.")),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-white" }, "5. Dialogue Sets Variables"),
                        react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" },
                            "When dialogue runs ",
                            react_1.default.createElement("code", { className: "text-xs" }, "<<set $var>>"),
                            ", it updates Variable Storage. Your game can read these back."))),
                react_1.default.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-blue-500 p-4 rounded mt-4" },
                    react_1.default.createElement("p", { className: "text-gray-300 text-xs" },
                        react_1.default.createElement("strong", null, "Remember:"),
                        " Variables live in Yarn Spinner's Variable Storage at runtime, not in the .yarn file. The file only contains commands that manipulate the storage."))))
        },
        yarn: {
            title: 'Yarn Spinner',
            content: (react_1.default.createElement("div", { className: "space-y-4 text-sm" },
                react_1.default.createElement("p", null, "Dialogue Forge exports to Yarn Spinner format for use in game engines like Unreal Engine."),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Basic Syntax"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: node_id
---
Speaker: Dialogue text here
<<set $flag_name = true>>
<<jump next_node_id>>
===`)),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Exporting"),
                react_1.default.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        "Click the ",
                        react_1.default.createElement("strong", null, "Yarn"),
                        " tab (code icon) to see generated script"),
                    react_1.default.createElement("li", null,
                        "Click ",
                        react_1.default.createElement("strong", null, "\"Download .yarn\""),
                        " to save the file"),
                    react_1.default.createElement("li", null,
                        "Import the ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, ".yarn"),
                        " file into your game engine")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Importing"),
                react_1.default.createElement("ol", { className: "list-decimal list-inside space-y-2 text-sm ml-2" },
                    react_1.default.createElement("li", null,
                        "Click the ",
                        react_1.default.createElement("strong", null, "Import"),
                        " button (upload icon)"),
                    react_1.default.createElement("li", null,
                        "Select a ",
                        react_1.default.createElement("code", { className: "bg-[#12121a] px-1 rounded" }, ".yarn"),
                        " file"),
                    react_1.default.createElement("li", null, "Nodes are automatically created from the Yarn structure"),
                    react_1.default.createElement("li", null, "Edit visually, then export again")),
                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-3" },
                    react_1.default.createElement("strong", null, "Note:"),
                    " Flags are managed separately. Import/export flag schemas using the Flag Manager."),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "\u2705 Yarn Features Supported"),
                react_1.default.createElement("div", { className: "space-y-3" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-green-400 text-xs" }, "Core Features"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                "Dialogue text with speakers (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "Speaker: Text"),
                                ")"),
                            react_1.default.createElement("li", null,
                                "Player choices (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "-> Choice text"),
                                ")"),
                            react_1.default.createElement("li", null,
                                "Node structure (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "title:"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "---"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "==="),
                                ")"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("strong", { className: "text-green-400 text-xs" }, "Commands"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                "Flag setting (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<set $flag = true>>"),
                                ")"),
                            react_1.default.createElement("li", null,
                                "Jumps (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<jump node_id>>"),
                                ")"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("strong", { className: "text-green-400 text-xs" }, "\u2705 Conditional Blocks (Full Support)"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<if condition>>"),
                                " - Conditional dialogue blocks"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<elseif condition>>"),
                                " - Alternative conditions"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<else>>"),
                                " - Default fallback"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<endif>>"),
                                " - End conditional block")),
                        react_1.default.createElement("p", { className: "text-gray-500 text-xs mt-2" }, "Supports nested conditionals in NPC nodes with multiple blocks")),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("strong", { className: "text-green-400 text-xs" }, "\u2705 Conditional Choices"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                "Choices can have conditions that wrap them in ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<if>>"),
                                " blocks"),
                            react_1.default.createElement("li", null, "Choices only appear when conditions are met"),
                            react_1.default.createElement("li", null, "Supports multiple conditions with AND logic"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("strong", { className: "text-green-400 text-xs" }, "\u2705 Condition Operators"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "is_set"),
                                " - Check if flag exists"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "is_not_set"),
                                " - Check if flag doesn't exist"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "=="),
                                " - Equals"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "!="),
                                " - Not equals"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, ">"),
                                " - Greater than"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<"),
                                " - Less than"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, ">="),
                                " - Greater or equal"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<="),
                                " - Less or equal"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-yellow-500/30" },
                        react_1.default.createElement("strong", { className: "text-yellow-400 text-xs" }, "\u26A0\uFE0F Partially Supported"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                "Basic variable setting (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<set $flag = true>>"),
                                ") - Boolean only"),
                            react_1.default.createElement("li", null, "String/number variables - Not yet supported"),
                            react_1.default.createElement("li", null,
                                "Variable operations (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "+="),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "-="),
                                ", etc.) - Not yet supported"),
                            react_1.default.createElement("li", null,
                                "Variable references in text (",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" },
                                    "\"Hello ",
                                    '{$name}',
                                    "\""),
                                ") - Not yet supported"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-orange-500/30" },
                        react_1.default.createElement("strong", { className: "text-orange-400 text-xs" }, "\u274C Not Yet Supported"),
                        react_1.default.createElement("ul", { className: "list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-500" },
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Commands:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<wait 2>>"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<stop>>"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<command param>>")),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Detour:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<detour node_id>>"),
                                " (temporary jump with return)"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Once:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "<<once>>"),
                                " (options appear only once)"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Shortcuts:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "[[text|node]]"),
                                " (inline navigation)"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Tags:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "#tag"),
                                " (node metadata)"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Node Headers:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "color:"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "group:"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "style: note")),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Functions:"),
                                " ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "visited(\"node_id\")"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "random(min, max)"),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "dice(sides)")),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Line Groups:"),
                                " Random/sequential line selection"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Smart Variables:"),
                                " Auto-incrementing, dependencies"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Enums:"),
                                " Enum type support"))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-blue-500/30 mt-3" },
                        react_1.default.createElement("strong", { className: "text-blue-400 text-xs" }, "\uD83D\uDCCB Yarn Spinner Feature Roadmap"),
                        react_1.default.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "We're actively working on full Yarn Spinner compatibility. Next priorities:"),
                        react_1.default.createElement("ol", { className: "list-decimal list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400" },
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Full Variable System"),
                                " - String, number, boolean variables with operations"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Advanced Set Operations"),
                                " - ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "+="),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "-="),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "*="),
                                ", ",
                                react_1.default.createElement("code", { className: "bg-[#0d0d14] px-1 rounded" }, "/=")),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Rebuild PlayView"),
                                " - Proper Yarn Spinner execution engine"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Commands & Shortcuts"),
                                " - wait, stop, detour, once, [[text|node]]"),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("strong", null, "Functions & Tags"),
                                " - visited(), random(), #tags, node headers")),
                        react_1.default.createElement("p", { className: "text-xs text-gray-500 mt-2 italic" }, "See the Roadmap section for detailed implementation plans."))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Conditional Dialogue with If/Elseif/Else"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: merchant_greeting
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
                    react_1.default.createElement("p", { className: "text-xs text-gray-400 mt-2" }, "This example shows multiple conditions: first checks if quest is complete, then if started, then if reputation is high enough, otherwise shows default greeting.")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Conditional Choices"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: guard_checkpoint
---
Guard: You're not allowed in!
-> Sure I am! The boss knows me! <<if $reputation > 10>>
    <<jump allowed_in>>
-> Please?
    <<jump begging>>
-> I'll come back later.
    <<jump leave>>
===`),
                    react_1.default.createElement("p", { className: "text-xs text-gray-400 mt-2" },
                        "The first choice only appears if ",
                        react_1.default.createElement("code", { className: "text-xs" }, "$reputation > 10"),
                        ". Other choices always show.")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Example: Conditional Choices with Multiple Conditions"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap" }, `title: merchant_shop
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
                    react_1.default.createElement("p", { className: "text-xs text-gray-400 mt-2" },
                        "Use ",
                        react_1.default.createElement("code", { className: "text-xs" }, "and"),
                        " to combine multiple conditions. Choices only appear when all conditions are met.")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Code Example"),
                react_1.default.createElement("div", { className: "bg-[#12121a] p-4 rounded border border-[#2a2a3e]" },
                    react_1.default.createElement("pre", { className: "text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto" }, `import { importFromYarn, exportToYarn } from '@portfolio/dialogue-forge';

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
            content: (react_1.default.createElement("div", { className: "space-y-4 text-sm" },
                react_1.default.createElement("ul", { className: "space-y-2" },
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Ctrl+Z"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Undo last action (Cmd+Z on Mac)")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Ctrl+Y"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Redo last action (Cmd+Y on Mac)")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Delete"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Delete selected node(s) or edge(s)")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Escape"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Close menus, deselect node")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Right-click"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Context menu (on graph or node)")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Scroll"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Zoom in/out on graph")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Drag"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Pan the graph view (middle mouse or space + drag)")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Drag node"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Move node position")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Drag port"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Create connection to another node")),
                    react_1.default.createElement("li", { className: "flex items-start gap-2" },
                        react_1.default.createElement("kbd", { className: "bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]" }, "Click + Drag"),
                        react_1.default.createElement("span", { className: "text-gray-400" }, "Select multiple nodes (selection box)")))))
        },
        roadmap: {
            title: 'Roadmap & Issues',
            content: (react_1.default.createElement("div", { className: "space-y-4 text-sm" },
                react_1.default.createElement("div", { className: "bg-[#1a2a3e] border-l-4 border-yellow-500 p-4 rounded mb-4" },
                    react_1.default.createElement("p", { className: "text-gray-300 text-xs mb-2" }, "This section tracks what we're working on and known issues. Check back for updates!"),
                    react_1.default.createElement("p", { className: "text-gray-400 text-xs" },
                        react_1.default.createElement("strong", null, "Note:"),
                        " For best experience, consider using the editor and simulator as separate pages in your application. The current embedded view may have scroll limitations.")),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "\u2705 Recently Completed"),
                react_1.default.createElement("div", { className: "space-y-2" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "React Flow Migration"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Complete rewrite using React Flow with custom nodes, edges, and improved UX")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Undo/Redo System"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Action history with Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Y (React Flow built-in)")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Multi-Select & Delete"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Selection box to select multiple nodes, bulk delete with Delete key (known issue: square selection doesn't always capture all nodes - deprioritized)")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Minimap"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Graph overview with navigation (React Flow built-in)")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-green-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-green-500 text-xs" }, "\u2705"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Edge Hover & Deletion"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Edges highlight on hover and can be deleted by selecting and pressing Delete"))))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "In Progress"),
                react_1.default.createElement("div", { className: "space-y-2" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-yellow-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-yellow-500 text-xs" }, "\uD83D\uDD04"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Enhanced Yarn Spinner Support"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Adding more Yarn Spinner features and improving graph node functionality"))))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Planned (High Priority)"),
                react_1.default.createElement("div", { className: "space-y-2" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Copy/Paste"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Copy selected nodes and paste with offset, duplicate nodes with connections")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Variables System"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Full Yarn variable support with UI for variable management")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Node Search/Filter"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Search nodes by ID, content, or flags used"))))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Planned (Medium Priority)"),
                react_1.default.createElement("div", { className: "space-y-2" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Advanced Set Operations"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Increment, decrement, multiply, divide for variables")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Commands Support"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Yarn Spinner command nodes with parameters")))),
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-[#2a2a3e]" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-blue-500 text-xs" }, "\uD83D\uDCCB"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Node Alignment Tools"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Align, distribute, and snap to grid"))))),
                react_1.default.createElement("h3", { className: "text-lg font-semibold mt-6 mb-2 text-white" }, "Known Issues"),
                react_1.default.createElement("div", { className: "space-y-2" },
                    react_1.default.createElement("div", { className: "bg-[#12121a] p-3 rounded border border-orange-500/30" },
                        react_1.default.createElement("div", { className: "flex items-start gap-2" },
                            react_1.default.createElement("span", { className: "text-orange-500 text-xs" }, "\u26A0\uFE0F"),
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("strong", { className: "text-white text-xs" }, "Square Selection"),
                                react_1.default.createElement("p", { className: "text-gray-400 text-xs mt-1" }, "Selection box doesn't always capture all nodes within the selection area (deprioritized)")))))))
        }
    };
    return (react_1.default.createElement("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", onClick: onClose },
        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex", onClick: (e) => e.stopPropagation() },
            react_1.default.createElement("div", { className: "w-64 border-r border-[#1a1a2e] bg-[#12121a] flex flex-col" },
                react_1.default.createElement("div", { className: "p-4 border-b border-[#1a1a2e]" },
                    react_1.default.createElement("h2", { className: "text-lg font-semibold text-white" }, "Guide")),
                react_1.default.createElement("nav", { className: "flex-1 overflow-y-auto p-2" }, Object.entries(sections).map(([key, section]) => (react_1.default.createElement("button", { key: key, onClick: () => setActiveSection(key), className: `w-full text-left px-3 py-2 rounded text-sm transition-colors mb-1 ${activeSection === key
                        ? 'bg-[#e94560] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a1a2e]'}` }, section.title))))),
            react_1.default.createElement("div", { className: "flex-1 overflow-y-auto p-6" },
                react_1.default.createElement("div", { className: "max-w-none" },
                    react_1.default.createElement("h1", { className: "text-2xl font-bold text-white mb-4" }, sections[activeSection].title),
                    react_1.default.createElement("div", { className: "text-gray-300" }, sections[activeSection].content))),
            react_1.default.createElement("button", { onClick: onClose, className: "absolute top-4 right-4 p-2 text-gray-400 hover:text-white" },
                react_1.default.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    react_1.default.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                    react_1.default.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))))));
}
