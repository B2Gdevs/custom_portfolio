import React, { useState } from 'react';

interface GuidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuidePanel({ isOpen, onClose }: GuidePanelProps) {
  const [activeSection, setActiveSection] = useState<string>('overview');

  if (!isOpen) return null;

  const sections = {
    overview: {
      title: 'Getting Started',
      content: (
        <div className="space-y-4 text-sm">
          <p>Dialogue Forge is a visual node-based editor for creating branching dialogue systems. Export to Yarn Spinner format for use in game engines.</p>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Node Types</h3>
          <div className="space-y-3">
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-[#e94560]">NPC Node</strong>
              <p className="text-gray-400 text-xs mt-1">Character dialogue. Has speaker name, dialogue text, and one output port (bottom circle) that connects to the next node.</p>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-purple-400">Player Node</strong>
              <p className="text-gray-400 text-xs mt-1">Choice point with multiple options. Each choice has its own output port (right side circles) that can branch to different nodes.</p>
            </div>
          </div>


          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Basic Workflow</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
            <li><strong>Create nodes</strong> - Right-click empty space or drag from output port</li>
            <li><strong>Edit content</strong> - Click a node to edit in the side panel</li>
            <li><strong>Connect nodes</strong> - Drag from output ports to connect</li>
            <li><strong>Set flags</strong> - Add flags to track game state</li>
            <li><strong>Export</strong> - Download Yarn file for your game</li>
          </ol>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Creating Nodes</h3>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
            <li><strong>Right-click</strong> anywhere on the graph → Select "NPC Node" or "Player Node"</li>
            <li><strong>Drag from output port</strong> → Release in empty space → Select node type from menu</li>
            <li><strong>Right-click a node</strong> → "Duplicate" to copy it</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Editing Nodes</h3>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
            <li><strong>Click a node</strong> to select it and open the editor panel</li>
            <li>Edit speaker, content, next node, and flags in the side panel</li>
            <li><strong>Right-click a node</strong> for quick actions: Edit, Add Choice, Duplicate, Delete, Play from Here</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Connecting Nodes</h3>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2">
            <li><strong>Drag from output port</strong> (circle at bottom of NPC or right of choice)</li>
            <li><strong>Release on target node</strong> to connect directly</li>
            <li><strong>Release in empty space</strong> to create a new connected node</li>
            <li>Each choice in a Player node can connect to different NPC nodes for branching</li>
          </ul>
        </div>
      )
    },
    flags: {
      title: 'Flags & Yarn Variables',
      content: (
        <div className="space-y-4 text-sm">
          <div className="bg-[#1a2a3e] border-l-4 border-[#e94560] p-4 rounded">
            <h3 className="text-white font-semibold mb-2">How Flags Work</h3>
            <p className="text-gray-300 text-xs mb-2">
              <strong>Flags are passed into the editor and used in the simulator.</strong>
            </p>
            <p className="text-gray-400 text-xs mb-2">
              Flags can be set during dialogue, which affects the state during simulation. Flags are exported/imported separately from dialogue.
            </p>
            <p className="text-gray-400 text-xs">
              In Yarn Spinner, flags become <code className="bg-[#0d0d14] px-1 rounded">$variable</code> commands like <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;set $flag = value&gt;&gt;</code>.
            </p>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">What Are Flags?</h3>
          <p className="text-gray-400">Flags are variables that track what's happened in your game. Examples:</p>
          <ul className="list-disc list-inside space-y-1 text-sm ml-2 text-gray-400">
            <li>Quest completed: <code className="bg-[#12121a] px-1 rounded">quest_dragon_slayer = "complete"</code></li>
            <li>Has item: <code className="bg-[#12121a] px-1 rounded">item_ancient_key = true</code></li>
            <li>Player reputation: <code className="bg-[#12121a] px-1 rounded">stat_reputation = 50</code></li>
            <li>Achievement unlocked: <code className="bg-[#12121a] px-1 rounded">achievement_first_quest = true</code></li>
          </ul>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Setting Up Flags</h3>
          <p className="text-gray-400 mb-3">Define your flags in code and pass them to the editor:</p>
          
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import { FlagSchema } from '@portfolio/dialogue-forge';

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
};`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Flag Types</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-blue-400">quest</strong> - Quest state (<code className="text-xs">'not_started'</code>, <code className="text-xs">'in_progress'</code>, <code className="text-xs">'complete'</code>)
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-yellow-400">achievement</strong> - Unlocked achievements (true/false)
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-green-400">item</strong> - Inventory items (true/false or quantity)
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-purple-400">stat</strong> - Player statistics (numbers: gold, reputation, etc.)
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-pink-400">title</strong> - Earned player titles (true/false)
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-gray-400">dialogue</strong> - Temporary, dialogue-scoped flags
            </div>
            <div className="bg-[#12121a] p-2 rounded border border-[#2a2a3e]">
              <strong className="text-gray-400">global</strong> - Global game state
            </div>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Using Flags in Editor</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
            <li>Pass <code className="bg-[#12121a] px-1 rounded">flagSchema</code> to the editor</li>
            <li>When setting flags, <strong>type to see matching flags</strong> in the dropdown</li>
            <li>Click a flag to add it (organized by category)</li>
            <li>Flags are exported to Yarn as <code className="bg-[#12121a] px-1 rounded">&lt;&lt;set $flag_name = true&gt;&gt;</code></li>
          </ol>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Flag Naming Convention</h3>
          <p className="text-gray-400 text-xs">Use prefixes to organize flags:</p>
          <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e] text-xs font-mono space-y-1">
            <div><code className="text-blue-400">quest_*</code> - Quest-related flags</div>
            <div><code className="text-yellow-400">achievement_*</code> - Achievements</div>
            <div><code className="text-green-400">item_*</code> - Items</div>
            <div><code className="text-purple-400">stat_*</code> - Statistics</div>
            <div><code className="text-pink-400">title_*</code> - Titles</div>
            <div><code className="text-gray-400">dialogue_*</code> - Dialogue-scoped (temporary)</div>
          </div>
        </div>
      )
    },
    integration: {
      title: 'Integration Guide',
      content: (
        <div className="space-y-4 text-sm">
          <p>How to integrate Dialogue Forge with your game.</p>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">1. Install Package</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300">npm install @portfolio/dialogue-forge</pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">2. Define Flag Schema</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import { FlagSchema } from '@portfolio/dialogue-forge';

const flagSchema: FlagSchema = {
  flags: [
    { id: 'quest_dragon_slayer', type: 'quest', category: 'quests' },
    { id: 'item_ancient_key', type: 'item', category: 'items' },
    { id: 'stat_gold', type: 'stat', category: 'stats', valueType: 'number' },
  ]
};`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">3. Load Dialogue from Yarn</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import { importFromYarn } from '@portfolio/dialogue-forge';

// Load Yarn file
const yarnContent = await loadFile('merchant.yarn');
const dialogue = importFromYarn(yarnContent, 'Merchant Dialogue');`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">4. Get Current Game Flags</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`// Get current player state
const currentFlags = {
  quest_dragon_slayer: 'complete',
  item_ancient_key: true,
  stat_gold: 1000,
  stat_reputation: 50
};`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">5. Edit Dialogue</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import { DialogueEditor, exportToYarn } from '@portfolio/dialogue-forge';

<DialogueEditor
  dialogue={dialogue}
  onChange={(updated) => {
    // Save edited dialogue
    const yarn = exportToYarn(updated);
    saveYarnFile(yarn);
  }}
  flagSchema={flagSchema}
  initialFlags={currentFlags}
/>`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">6. Run Dialogue (Simulation)</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import { DialogueSimulator } from '@portfolio/dialogue-forge';

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
    console.log('Flags updated:', flags);
  }}
/>`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Complete Example</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import {
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
/>`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">How Flags Work with Unreal</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-white">1. Export to Yarn</strong>
              <p className="text-gray-400 text-xs mt-1">
                When you export, flags become Yarn commands: <code className="text-xs">&lt;&lt;set $quest_dragon_slayer = "started"&gt;&gt;</code>
              </p>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-white">2. Import to Unreal</strong>
              <p className="text-gray-400 text-xs mt-1">
                Yarn Spinner loads the .yarn file and recognizes <code className="text-xs">$variable</code> references. Variables are stored in Yarn Spinner's <strong>Variable Storage</strong> component.
              </p>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-white">3. Game Sets Variables</strong>
              <p className="text-gray-400 text-xs mt-1">
                Your Unreal code sets initial state: <code className="text-xs">VariableStorage-&gt;SetValue("quest_dragon_slayer", "not_started")</code>
              </p>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-white">4. Dialogue Reacts</strong>
              <p className="text-gray-400 text-xs mt-1">
                Yarn checks variables: <code className="text-xs">&lt;&lt;if $quest_dragon_slayer == "started"&gt;&gt;</code> reads from Variable Storage.
              </p>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-white">5. Dialogue Sets Variables</strong>
              <p className="text-gray-400 text-xs mt-1">
                When dialogue runs <code className="text-xs">&lt;&lt;set $var&gt;&gt;</code>, it updates Variable Storage. Your game can read these back.
              </p>
            </div>
          </div>
          
          <div className="bg-[#1a2a3e] border-l-4 border-blue-500 p-4 rounded mt-4">
            <p className="text-gray-300 text-xs">
              <strong>Remember:</strong> Variables live in Yarn Spinner's Variable Storage at runtime, not in the .yarn file. The file only contains commands that manipulate the storage.
            </p>
          </div>
        </div>
      )
    },
    yarn: {
      title: 'Yarn Spinner',
      content: (
        <div className="space-y-4 text-sm">
          <p>Dialogue Forge exports to Yarn Spinner format for use in game engines like Unreal Engine.</p>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Basic Syntax</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
{`title: node_id
---
Speaker: Dialogue text here
<<set $flag_name = true>>
<<jump next_node_id>>
===`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Exporting</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
            <li>Click the <strong>Yarn</strong> tab (code icon) to see generated script</li>
            <li>Click <strong>"Download .yarn"</strong> to save the file</li>
            <li>Import the <code className="bg-[#12121a] px-1 rounded">.yarn</code> file into your game engine</li>
          </ol>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Importing</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
            <li>Click the <strong>Import</strong> button (upload icon)</li>
            <li>Select a <code className="bg-[#12121a] px-1 rounded">.yarn</code> file</li>
            <li>Nodes are automatically created from the Yarn structure</li>
            <li>Edit visually, then export again</li>
          </ol>
          
          <p className="text-gray-400 text-xs mt-3">
            <strong>Note:</strong> Flags are managed separately. Import/export flag schemas using the Flag Manager.
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">✅ Yarn Features Supported</h3>
          <div className="space-y-3">
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-green-400 text-xs">Core Features</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li>Dialogue text with speakers (<code className="bg-[#0d0d14] px-1 rounded">Speaker: Text</code>)</li>
                <li>Player choices (<code className="bg-[#0d0d14] px-1 rounded">-&gt; Choice text</code>)</li>
                <li>Node structure (<code className="bg-[#0d0d14] px-1 rounded">title:</code>, <code className="bg-[#0d0d14] px-1 rounded">---</code>, <code className="bg-[#0d0d14] px-1 rounded">===</code>)</li>
              </ul>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <strong className="text-green-400 text-xs">Commands</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li>Flag setting (<code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;set $flag = true&gt;&gt;</code>)</li>
                <li>Jumps (<code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;jump node_id&gt;&gt;</code>)</li>
              </ul>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <strong className="text-green-400 text-xs">✅ Conditional Blocks (Full Support)</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li><code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;if condition&gt;&gt;</code> - Conditional dialogue blocks</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;elseif condition&gt;&gt;</code> - Alternative conditions</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;else&gt;&gt;</code> - Default fallback</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;endif&gt;&gt;</code> - End conditional block</li>
              </ul>
              <p className="text-gray-500 text-xs mt-2">Supports nested conditionals in NPC nodes with multiple blocks</p>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <strong className="text-green-400 text-xs">✅ Conditional Choices</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li>Choices can have conditions that wrap them in <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;if&gt;&gt;</code> blocks</li>
                <li>Choices only appear when conditions are met</li>
                <li>Supports multiple conditions with AND logic</li>
              </ul>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <strong className="text-green-400 text-xs">✅ Condition Operators</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li><code className="bg-[#0d0d14] px-1 rounded">is_set</code> - Check if flag exists</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">is_not_set</code> - Check if flag doesn't exist</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">==</code> - Equals</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">!=</code> - Not equals</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&gt;</code> - Greater than</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&lt;</code> - Less than</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&gt;=</code> - Greater or equal</li>
                <li><code className="bg-[#0d0d14] px-1 rounded">&lt;=</code> - Less or equal</li>
              </ul>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-yellow-500/30">
              <strong className="text-yellow-400 text-xs">⚠️ Partially Supported</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li>Basic variable setting (<code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;set $flag = true&gt;&gt;</code>) - Boolean only</li>
                <li>String/number variables - Not yet supported</li>
                <li>Variable operations (<code className="bg-[#0d0d14] px-1 rounded">+=</code>, <code className="bg-[#0d0d14] px-1 rounded">-=</code>, etc.) - Not yet supported</li>
                <li>Variable references in text (<code className="bg-[#0d0d14] px-1 rounded">"Hello {$name}"</code>) - Not yet supported</li>
              </ul>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-orange-500/30">
              <strong className="text-orange-400 text-xs">❌ Not Yet Supported</strong>
              <ul className="list-disc list-inside space-y-1 text-xs mt-2 ml-2 text-gray-500">
                <li><strong>Commands:</strong> <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;wait 2&gt;&gt;</code>, <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;stop&gt;&gt;</code>, <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;command param&gt;&gt;</code></li>
                <li><strong>Detour:</strong> <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;detour node_id&gt;&gt;</code> (temporary jump with return)</li>
                <li><strong>Once:</strong> <code className="bg-[#0d0d14] px-1 rounded">&lt;&lt;once&gt;&gt;</code> (options appear only once)</li>
                <li><strong>Shortcuts:</strong> <code className="bg-[#0d0d14] px-1 rounded">[[text|node]]</code> (inline navigation)</li>
                <li><strong>Tags:</strong> <code className="bg-[#0d0d14] px-1 rounded">#tag</code> (node metadata)</li>
                <li><strong>Node Headers:</strong> <code className="bg-[#0d0d14] px-1 rounded">color:</code>, <code className="bg-[#0d0d14] px-1 rounded">group:</code>, <code className="bg-[#0d0d14] px-1 rounded">style: note</code></li>
                <li><strong>Functions:</strong> <code className="bg-[#0d0d14] px-1 rounded">visited("node_id")</code>, <code className="bg-[#0d0d14] px-1 rounded">random(min, max)</code>, <code className="bg-[#0d0d14] px-1 rounded">dice(sides)</code></li>
                <li><strong>Line Groups:</strong> Random/sequential line selection</li>
                <li><strong>Smart Variables:</strong> Auto-incrementing, dependencies</li>
                <li><strong>Enums:</strong> Enum type support</li>
              </ul>
            </div>
            
            <div className="bg-[#12121a] p-3 rounded border border-blue-500/30 mt-3">
              <strong className="text-blue-400 text-xs">📋 Yarn Spinner Feature Roadmap</strong>
              <p className="text-xs text-gray-400 mt-2">
                We're actively working on full Yarn Spinner compatibility. Next priorities:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs mt-2 ml-2 text-gray-400">
                <li><strong>Full Variable System</strong> - String, number, boolean variables with operations</li>
                <li><strong>Advanced Set Operations</strong> - <code className="bg-[#0d0d14] px-1 rounded">+=</code>, <code className="bg-[#0d0d14] px-1 rounded">-=</code>, <code className="bg-[#0d0d14] px-1 rounded">*=</code>, <code className="bg-[#0d0d14] px-1 rounded">/=</code></li>
                <li><strong>Rebuild PlayView</strong> - Proper Yarn Spinner execution engine</li>
                <li><strong>Commands & Shortcuts</strong> - wait, stop, detour, once, [[text|node]]</li>
                <li><strong>Functions & Tags</strong> - visited(), random(), #tags, node headers</li>
              </ol>
              <p className="text-xs text-gray-500 mt-2 italic">
                See the Roadmap section for detailed implementation plans.
              </p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Example: Conditional Dialogue with If/Elseif/Else</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
{`title: merchant_greeting
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
===`}
            </pre>
            <p className="text-xs text-gray-400 mt-2">
              This example shows multiple conditions: first checks if quest is complete, then if started, then if reputation is high enough, otherwise shows default greeting.
            </p>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Example: Conditional Choices</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
{`title: guard_checkpoint
---
Guard: You're not allowed in!
-> Sure I am! The boss knows me! <<if $reputation > 10>>
    <<jump allowed_in>>
-> Please?
    <<jump begging>>
-> I'll come back later.
    <<jump leave>>
===`}
            </pre>
            <p className="text-xs text-gray-400 mt-2">
              The first choice only appears if <code className="text-xs">$reputation &gt; 10</code>. Other choices always show.
            </p>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Example: Conditional Choices with Multiple Conditions</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
{`title: merchant_shop
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
===`}
            </pre>
            <p className="text-xs text-gray-400 mt-2">
              Use <code className="text-xs">and</code> to combine multiple conditions. Choices only appear when all conditions are met.
            </p>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Code Example</h3>
          <div className="bg-[#12121a] p-4 rounded border border-[#2a2a3e]">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto">
{`import { importFromYarn, exportToYarn } from '@portfolio/dialogue-forge';

// Import existing Yarn file
const yarnContent = await fetch('dialogue.yarn').then(r => r.text());
const dialogue = importFromYarn(yarnContent, 'My Dialogue');

// Edit it...

// Export back to Yarn
const newYarn = exportToYarn(dialogue);
await saveFile('dialogue.yarn', newYarn);`}
            </pre>
          </div>
        </div>
      )
    },
    shortcuts: {
      title: 'Keyboard Shortcuts',
      content: (
        <div className="space-y-4 text-sm">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Ctrl+Z</kbd>
              <span className="text-gray-400">Undo last action (Cmd+Z on Mac)</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Ctrl+Y</kbd>
              <span className="text-gray-400">Redo last action (Cmd+Y on Mac)</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Delete</kbd>
              <span className="text-gray-400">Delete selected node(s) or edge(s)</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Escape</kbd>
              <span className="text-gray-400">Close menus, deselect node</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Right-click</kbd>
              <span className="text-gray-400">Context menu (on graph or node)</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Scroll</kbd>
              <span className="text-gray-400">Zoom in/out on graph</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Drag</kbd>
              <span className="text-gray-400">Pan the graph view (middle mouse or space + drag)</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Drag node</kbd>
              <span className="text-gray-400">Move node position</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Drag port</kbd>
              <span className="text-gray-400">Create connection to another node</span>
            </li>
            <li className="flex items-start gap-2">
              <kbd className="bg-[#12121a] px-2 py-1 rounded text-xs font-mono border border-[#2a2a3e]">Click + Drag</kbd>
              <span className="text-gray-400">Select multiple nodes (selection box)</span>
            </li>
          </ul>
        </div>
      )
    },
    roadmap: {
      title: 'Roadmap & Issues',
      content: (
        <div className="space-y-4 text-sm">
          <div className="bg-[#1a2a3e] border-l-4 border-yellow-500 p-4 rounded mb-4">
            <p className="text-gray-300 text-xs mb-2">
              This section tracks what we're working on and known issues. Check back for updates!
            </p>
            <p className="text-gray-400 text-xs">
              <strong>Note:</strong> For best experience, consider using the editor and simulator as separate pages in your application. The current embedded view may have scroll limitations.
            </p>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">✅ Recently Completed</h3>
          <div className="space-y-2">
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <div className="flex items-start gap-2">
                <span className="text-green-500 text-xs">✅</span>
                <div>
                  <strong className="text-white text-xs">React Flow Migration</strong>
                  <p className="text-gray-400 text-xs mt-1">Complete rewrite using React Flow with custom nodes, edges, and improved UX</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <div className="flex items-start gap-2">
                <span className="text-green-500 text-xs">✅</span>
                <div>
                  <strong className="text-white text-xs">Undo/Redo System</strong>
                  <p className="text-gray-400 text-xs mt-1">Action history with Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Y (React Flow built-in)</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <div className="flex items-start gap-2">
                <span className="text-green-500 text-xs">✅</span>
                <div>
                  <strong className="text-white text-xs">Multi-Select & Delete</strong>
                  <p className="text-gray-400 text-xs mt-1">Selection box to select multiple nodes, bulk delete with Delete key (known issue: square selection doesn't always capture all nodes - deprioritized)</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <div className="flex items-start gap-2">
                <span className="text-green-500 text-xs">✅</span>
                <div>
                  <strong className="text-white text-xs">Minimap</strong>
                  <p className="text-gray-400 text-xs mt-1">Graph overview with navigation (React Flow built-in)</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-green-500/30">
              <div className="flex items-start gap-2">
                <span className="text-green-500 text-xs">✅</span>
                <div>
                  <strong className="text-white text-xs">Edge Hover & Deletion</strong>
                  <p className="text-gray-400 text-xs mt-1">Edges highlight on hover and can be deleted by selecting and pressing Delete</p>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">In Progress</h3>
          <div className="space-y-2">
            <div className="bg-[#12121a] p-3 rounded border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <span className="text-yellow-500 text-xs">🔄</span>
                <div>
                  <strong className="text-white text-xs">Enhanced Yarn Spinner Support</strong>
                  <p className="text-gray-400 text-xs mt-1">Adding more Yarn Spinner features and improving graph node functionality</p>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Planned (High Priority)</h3>
          <div className="space-y-2">
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">📋</span>
                <div>
                  <strong className="text-white text-xs">Copy/Paste</strong>
                  <p className="text-gray-400 text-xs mt-1">Copy selected nodes and paste with offset, duplicate nodes with connections</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">📋</span>
                <div>
                  <strong className="text-white text-xs">Variables System</strong>
                  <p className="text-gray-400 text-xs mt-1">Full Yarn variable support with UI for variable management</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">📋</span>
                <div>
                  <strong className="text-white text-xs">Node Search/Filter</strong>
                  <p className="text-gray-400 text-xs mt-1">Search nodes by ID, content, or flags used</p>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Planned (Medium Priority)</h3>
          <div className="space-y-2">
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">📋</span>
                <div>
                  <strong className="text-white text-xs">Advanced Set Operations</strong>
                  <p className="text-gray-400 text-xs mt-1">Increment, decrement, multiply, divide for variables</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">📋</span>
                <div>
                  <strong className="text-white text-xs">Commands Support</strong>
                  <p className="text-gray-400 text-xs mt-1">Yarn Spinner command nodes with parameters</p>
                </div>
              </div>
            </div>
            <div className="bg-[#12121a] p-3 rounded border border-[#2a2a3e]">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xs">📋</span>
                <div>
                  <strong className="text-white text-xs">Node Alignment Tools</strong>
                  <p className="text-gray-400 text-xs mt-1">Align, distribute, and snap to grid</p>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-2 text-white">Known Issues</h3>
          <div className="space-y-2">
            <div className="bg-[#12121a] p-3 rounded border border-orange-500/30">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 text-xs">⚠️</span>
                <div>
                  <strong className="text-white text-xs">Square Selection</strong>
                  <p className="text-gray-400 text-xs mt-1">Selection box doesn't always capture all nodes within the selection area (deprioritized)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-64 border-r border-[#1a1a2e] bg-[#12121a] flex flex-col">
          <div className="p-4 border-b border-[#1a1a2e]">
            <h2 className="text-lg font-semibold text-white">Guide</h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors mb-1 ${
                  activeSection === key
                    ? 'bg-[#e94560] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a2e]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-none">
            <h1 className="text-2xl font-bold text-white mb-4">
              {sections[activeSection as keyof typeof sections].title}
            </h1>
            <div className="text-gray-300">
              {sections[activeSection as keyof typeof sections].content}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
