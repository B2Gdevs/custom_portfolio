# Dialogue Forge Guide

> **Welcome!** This guide will help you learn how to create interactive dialogues that work seamlessly with Yarn Spinner in Unreal Engine.

## What is Dialogue Forge?

Dialogue Forge is a visual, node-based editor for creating branching dialogue systems. Think of it like Unreal's Blueprints, but specifically for dialogue. You can:

- **Create** dialogues visually by connecting nodes
- **Test** dialogues in real-time
- **Export** to Yarn Spinner format for Unreal Engine
- **Import** existing Yarn files to edit them visually

## Understanding Flags and Yarn Variables

### The Key Concept

**Flags in Dialogue Forge = Variables in Yarn Spinner**

When you set a flag in Dialogue Forge, it becomes a Yarn variable (like `$quest_complete`). These variables are **not stored in the .yarn file** - they're managed by Yarn Spinner's variable storage system at runtime.

### How It Works

1. **In Dialogue Forge**: You define flags (quests, items, stats, etc.) in a Flag Schema
2. **When Exporting**: Flags are converted to Yarn variable commands (`<<set $flag_name = value>>`)
3. **In Unreal**: Yarn Spinner's Variable Storage manages these variables
4. **At Runtime**: Your game code can read/write these variables, and they persist across dialogue sessions

### Example Flow

```yarn
# In your exported .yarn file:
title: merchant_greeting
---
Merchant: "Welcome! I see you've completed the quest."
<<set $quest_dragon_slayer = "complete">>
<<set $stat_gold += 500>>
===
```

In Unreal, Yarn Spinner will:
- Store `$quest_dragon_slayer = "complete"` in its Variable Storage
- Store `$stat_gold` (incremented by 500) in its Variable Storage
- These variables persist and can be accessed by your game code

## Getting Started

### Step 1: Define Your Flags

Flags represent your game state. Think of them as:
- **Quest flags**: Track quest progress (`quest_dragon_slayer = "started"`)
- **Item flags**: Track inventory (`item_key = true`)
- **Stat flags**: Track player stats (`stat_gold = 1000`)
- **Dialogue flags**: Temporary dialogue memory (`dialogue_met_merchant = true`)

```typescript
import { FlagSchema, FLAG_TYPE, FLAG_VALUE_TYPE } from '@portfolio/dialogue-forge';

const myFlags: FlagSchema = {
  flags: [
    {
      id: 'quest_dragon_slayer',
      name: 'Dragon Slayer Quest',
      type: FLAG_TYPE.QUEST,
      valueType: FLAG_VALUE_TYPE.STRING
    },
    {
      id: 'item_key',
      name: 'Ancient Key',
      type: FLAG_TYPE.ITEM
    },
    {
      id: 'stat_gold',
      name: 'Gold',
      type: FLAG_TYPE.STAT,
      valueType: FLAG_VALUE_TYPE.NUMBER,
      defaultValue: 0
    }
  ]
};
```

### Step 2: Create Your Dialogue

1. **Right-click** on the graph → Add NPC Node
2. **Click the node** → Edit in the side panel
3. **Drag from the bottom port** → Create connected nodes
4. **Add choices** by creating Player nodes

### Step 3: Set Flags

When a player makes a choice or reaches a node, you can set flags:

- **In Node Editor**: Add flags to "Set Flags" field
- **In Choices**: Each choice can set different flags
- **Flag Selector**: Use the dropdown to pick from your defined flags

These will export as: `<<set $flag_name = value>>`

#### Advanced Variable Operations

You can also perform operations on variables:

- **Increment**: `<<set $stat_gold += 100>>` - Add 100 to gold
- **Decrement**: `<<set $stat_gold -= 50>>` - Subtract 50 from gold
- **Multiply**: `<<set $stat_gold *= 2>>` - Double the gold
- **Divide**: `<<set $stat_gold /= 2>>` - Halve the gold

#### Variable Interpolation

You can display variable values in dialogue text using `{$variable}`:

```yarn
Merchant: "You currently have {$stat_gold} gold pieces."
```

This will show the actual value of `$stat_gold` when the dialogue runs.

### Step 4: Use Conditions

Make choices appear only when certain conditions are met:

- **Flag is set**: Choice only shows if flag exists
- **Flag equals value**: `stat_gold >= 100` (only show if player has enough gold)
- **Flag not set**: Hide choice if flag exists

These export as: `<<if $flag_name>>` or `<<if $stat_gold >= 100>>`

#### Editing Conditions

When editing conditions, you'll see a helpful 2-column editor:

- **Left Sidebar**: Quick reference with operators (`==`, `!=`, `>=`, etc.), keywords (`and`, `not`), and templates
- **Right Panel**: Main condition editor with autocomplete
- **Pro Tip**: Type `$` to see all available variables and flags from your schema
- **Autocomplete**: Shows suggestions as you type, with tag-based styling for easy identification

## Working with Unreal Engine

### Exporting to Unreal

1. **Click "Export Yarn"** → Download `.yarn` file
2. **Import into Unreal**: Add the `.yarn` file to your Yarn Spinner project
3. **Yarn Spinner handles variables**: All `$variable` references are managed automatically

### Variable Storage in Unreal

Yarn Spinner's Unreal plugin uses a **Variable Storage** component that:
- Stores all `$variable` values
- Persists across dialogue sessions
- Can be accessed from Blueprints/C++

**Important**: Variables are stored in the Variable Storage, **not in the .yarn file**. The .yarn file only contains the commands to set/check them.

### Bidirectional Flow

```
Dialogue Forge          Yarn Spinner          Your Game
     │                       │                    │
     │── Export .yarn ──────>│                    │
     │                       │                    │
     │                       │── Load .yarn ─────>│
     │                       │                    │
     │                       │<── Set Variables ──│
     │                       │                    │
     │<── Import .yarn ──────│                    │
     │                       │                    │
```

1. **Edit in Dialogue Forge** → Export `.yarn` → Import to Unreal
2. **Game sets variables** → Yarn Spinner reads them → Dialogue reacts
3. **Dialogue sets variables** → Yarn Spinner stores them → Game reads them

### Example: Quest System

```yarn
# In Dialogue Forge, you set:
# Flag: quest_dragon_slayer
# When: Player accepts quest

# Exports as:
title: quest_offer
---
NPC: "Will you help slay the dragon?"
-> "Yes, I'll help!"
    <<set $quest_dragon_slayer = "started">>
    <<jump quest_started>>
-> "Not right now"
    <<jump quest_declined>>
===
```

In Unreal:
1. Player selects "Yes, I'll help!"
2. Yarn Spinner sets `$quest_dragon_slayer = "started"` in Variable Storage
3. Your game code can read this: `GetVariableStorage()->GetValue("quest_dragon_slayer")`
4. Later dialogues can check: `<<if $quest_dragon_slayer == "started">>`

## Node Types

### NPC Node
**What it does**: An NPC speaks to the player

- **Speaker**: Character name (e.g., "Merchant")
- **Content**: What they say
- **Set Flags**: Flags to set when this node is reached
- **Next Node**: Where to go after speaking

### Player Node
**What it does**: Player makes a choice

- **Choices**: List of options player can pick
- Each choice can:
  - Have conditions (only show if flag is set)
  - Set flags when selected
  - Jump to different nodes

## Tips & Best Practices

### Flag Naming
Use prefixes to organize:
- `quest_*` - Quest-related flags
- `item_*` - Inventory items
- `stat_*` - Player statistics
- `dialogue_*` - Temporary dialogue memory

### Node IDs
Use descriptive IDs:
- ✅ `merchant_greeting`
- ✅ `quest_dragon_accept`
- ❌ `node1`, `node2`

### Testing
- Use **Play View** to test your dialogue
- Use **Debug Flags** panel to see flag changes
- Test different flag states to see conditional choices

### Exporting
- Export frequently to save your work
- The `.yarn` file is what Unreal uses
- Flag schemas are separate (export/import them too!)

## Keyboard Shortcuts

- **Delete/Backspace** - Delete selected node
- **Escape** - Close menus, deselect
- **Scroll** - Zoom in/out
- **Right-click** - Context menu
- **Drag ports** - Connect nodes

## Next Steps

- Check out the **Examples** (document icon) to see working dialogues
- Read [DATA_STRUCTURES.md](./DATA_STRUCTURES.md) for type reference
- Read [INTEGRATION.md](./INTEGRATION.md) for detailed integration guide

## Common Questions

**Q: Do flags live in the .yarn file?**  
A: No! Flags are converted to Yarn variables (`$variable`), which are stored in Yarn Spinner's Variable Storage at runtime, not in the file.

**Q: How do I sync flags between Dialogue Forge and Unreal?**  
A: Export your Flag Schema (JSON) and import it into your game. The flag IDs should match the variable names in Yarn.

**Q: Can I use existing Yarn files?**  
A: Yes! Import `.yarn` files and edit them visually. Variables in the file will be detected.

**Q: How do conditions work in Unreal?**  
A: Yarn Spinner evaluates `<<if>>` statements using its Variable Storage. Your conditions export as Yarn conditionals.
