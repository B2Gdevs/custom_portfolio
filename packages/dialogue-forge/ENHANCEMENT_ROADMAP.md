# Enhancement Roadmap

## ✅ Recently Completed (V2 Migration)

- [x] **React Flow Migration** - Complete rewrite using React Flow
  - Custom NPC and Player node components
  - Color-coded choice edges
  - Node dragging, pan, zoom (React Flow built-in)
  - Context menus (pane and node)
  - NodeEditor sidebar integration
  - Flag indicators on nodes with color coding
  - Fixed all critical bugs (flag duplication, PlayView freeze, handle positioning)

- [x] **Minimap** - React Flow built-in minimap
- [x] **Zoom Controls** - React Flow built-in controls
- [x] **Node Context Menu** - Right-click on nodes for quick actions
- [x] **Flag System** - Full flag support with color coding (quest, achievement, item, stat, title, global, dialogue)
- [x] **Edge Drop Menu** - Create nodes when dropping edge on empty space with auto-connect
- [x] **Multi-Select** - Selection box (drag to select) and multi-delete
- [x] **Delete Key** - Delete selected nodes with Delete/Backspace key
- [x] **Undo/Redo** - React Flow built-in undo/redo system

## Yarn Spinner Feature Support

### Phase 1: Core Conditionals & Variables (High Priority)
- [x] **Conditional Blocks** (`<<if>>`, `<<elseif>>`, `<<else>>`, `<<endif>>`) - Basic support exists
  - [x] Basic conditional blocks in NodeEditor
  - [x] Export/import conditional blocks
  - [ ] Visual conditional nodes in graph editor (enhancement)
  - [x] Support flag checks with operators (==, !=, >, <, >=, <=)
  - [ ] Nested conditionals (enhancement)

- [ ] **Variables** (`$variable`) - **NEXT PRIORITY**
  - Variable management UI
  - Variable types (string, number, boolean)
  - Variable operations (set, increment, decrement, multiply, divide)
  - Variable references in dialogue text

- [ ] **Advanced Set Operations**
  - `<<set $var += 10>>` (increment)
  - `<<set $var -= 5>>` (decrement)
  - `<<set $var *= 2>>` (multiply)
  - `<<set $var /= 2>>` (divide)
  - `<<set $var = "string">>` (string assignment)
  - `<<set $var = 42>>` (number assignment)

### Phase 2: Commands & Shortcuts (Medium Priority)
- [ ] **Commands** (`<<command>>`)
  - Command node type
  - Command parameters
  - Custom command definitions
  - Command execution in simulation

- [ ] **Shortcuts** (`[[text|node]]`)
  - Inline shortcuts in dialogue text
  - Visual representation in editor
  - Clickable shortcuts in play view

- [ ] **Tags** (`#tag`)
  - Tag system for nodes
  - Filter/search by tags
  - Tag-based organization

### Phase 3: Advanced Features (Lower Priority)
- [ ] **Functions**
  - Built-in functions (random, visited, etc.)
  - Custom function support
  - Function calls in conditions

- [ ] **Wait/Stop Commands**
  - `<<wait 2>>` - Pause dialogue
  - `<<stop>>` - End dialogue
  - Timing controls

- [ ] **Localization Support**
  - Multi-language support
  - String table integration
  - Language switching

## Graph Editor Enhancements

### Phase 1: Core UX Improvements (High Priority)
- [x] **Minimap** - ✅ React Flow built-in
  - [x] Overview of entire graph
  - [x] Click to navigate
  - [x] Current view indicator

- [x] **Zoom Controls** - ✅ React Flow built-in
  - [x] Zoom in/out buttons
  - [x] Mouse wheel zoom
  - [x] Zoom to fit
  - [ ] Zoom to selection (enhancement)

- [x] **Multi-Select** - ✅ Complete (with known issues - deprioritized)
  - [x] Click + drag to select multiple nodes (selection box)
  - [x] Multi-select with selection box
  - [x] Bulk operations (delete multiple nodes)
  - [x] Selection box visual feedback
  - [ ] Shift+click for multi-select (enhancement - **DEPRIORITIZED**)
  - [ ] Copy/paste for multi-selected nodes (next feature)
  - [ ] **Known Issue**: Square selection doesn't always capture all nodes in the selection box (deprioritized)

- [ ] **Copy/Paste** - **HIGH PRIORITY**
  - Copy selected nodes
  - Paste with offset
  - Duplicate nodes
  - Copy connections

- [x] **Undo/Redo** - ✅ Complete (React Flow built-in)
  - [x] Action history (React Flow manages)
  - [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y / Cmd+Z, Cmd+Y)
  - [x] Works for all node/edge operations
  - [ ] Visual undo/redo buttons (enhancement)

### Phase 2: Navigation & Organization (Medium Priority)
- [ ] **Node Search/Filter** - **MEDIUM PRIORITY**
  - Search by node ID, content, speaker
  - Filter by node type
  - Filter by flags used
  - Highlight search results
  - Jump to node from search

- [ ] **Node Grouping/Folders** - **LOWER PRIORITY**
  - Group related nodes
  - Collapse/expand groups
  - Visual grouping indicators
  - Move groups together

- [x] **Better Edge Routing** - ✅ Partially complete
  - [x] Curved edges (React Flow smoothstep)
  - [x] Edge colors by type (choice edges color-coded)
  - [x] Edge hover highlighting
  - [x] Edge deletion (Delete key or click to select + delete)
  - [ ] Smart edge paths (avoid nodes) - enhancement
  - [ ] Edge labels - enhancement

- [ ] **Node Alignment Tools**
  - Align left/right/center
  - Align top/bottom/middle
  - Distribute evenly
  - Snap to grid

### Phase 3: Advanced Features (Lower Priority)
- [ ] **Node Templates**
  - Save node templates
  - Quick insert templates
  - Template library

- [ ] **Keyboard Shortcuts**
  - Comprehensive shortcut system
  - Customizable shortcuts
  - Shortcut hints/cheat sheet

- [ ] **Visual Enhancements**
  - Node icons
  - Custom node colors
  - Connection animations
  - Better visual feedback

- [ ] **Performance Optimizations**
  - Virtual scrolling for large graphs
  - Lazy node rendering
  - Optimized edge rendering

## Implementation Priority

### 🔥 Immediate (Next Sprint) - Critical for Production
1. **Copy/paste** - Essential for workflow efficiency
2. **Variables system** - Core Yarn Spinner feature
3. **Node search/filter** - Essential for large dialogues
4. **Visual undo/redo buttons** - Better UX
5. **Zoom to selection** - Quality of life improvement

### 📅 Short Term (Next Month) - High Value Features
1. **Advanced set operations** - Increment, decrement, multiply, divide
2. **Node search/filter** - Essential for large dialogues
3. **Visual undo/redo buttons** - Better UX
4. **Zoom to selection** - Quality of life improvement
5. **Better error handling** - Validation and user feedback

### 🎯 Medium Term (Next Quarter) - Feature Enhancements
1. **Commands support** (`<<command>>`)
2. **Shortcuts** (`[[text|node]]`)
3. **Tags system** (`#tag`)
4. **Node alignment tools** - Align, distribute, snap to grid
5. **Nested conditionals** - Enhanced conditional support

### 🚀 Long Term (Future) - Nice to Have
1. **Functions** - Built-in and custom functions
2. **Localization** - Multi-language support
3. **Node templates** - Reusable node patterns
4. **Node grouping/folders** - Organization for large projects
5. **Performance optimizations** - Virtual scrolling, lazy rendering
6. **Advanced visual features** - Animations, custom colors, icons

## Known Issues & Bugs

### Critical Bugs (Fix Immediately)
- [ ] None currently - all critical bugs resolved

### Minor Issues
- [ ] Flag display in NodeEditor can be stale until tab switch (monitoring - partially fixed)
- [ ] Square selection doesn't always capture all nodes in the selection box (deprioritized)

## Technical Debt

- [x] Clean up V1 components (removed DialogueEditorV1 and GraphViewV1)
- [ ] Improve type safety in reactflow-converter
- [ ] Add comprehensive error boundaries
- [ ] Improve test coverage
- [ ] Performance profiling for large graphs (100+ nodes)

## Technical Considerations

### Data Structure Updates
- Add `ConditionalNode` type for if/else blocks
- Add `CommandNode` type for commands
- Extend `DialogueNode` with variable support
- Add `VariableDefinition` to schema

### UI Components Needed
- ConditionalNodeEditor
- VariableManager
- ~~Minimap component~~ ✅ (React Flow built-in)
- ~~ZoomControls component~~ ✅ (React Flow built-in)
- ~~MultiSelectHandler~~ ✅ (React Flow built-in)
- ~~UndoRedoManager~~ ✅ (React Flow built-in)

### Yarn Converter Updates
- Parse conditional blocks
- Parse variables
- Parse commands
- Parse shortcuts
- Export all new features


