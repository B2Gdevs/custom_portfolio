# Enhancement Roadmap

## Yarn Spinner Feature Support

### Phase 1: Core Conditionals & Variables (High Priority)
- [ ] **Conditional Blocks** (`<<if>>`, `<<elseif>>`, `<<else>>`, `<<endif>>`)
  - Visual conditional nodes in graph editor
  - Support flag checks with operators (==, !=, >, <, >=, <=)
  - Nested conditionals
  - Export/import conditional blocks

- [ ] **Variables** (`$variable`)
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
- [ ] **Minimap**
  - Overview of entire graph
  - Click to navigate
  - Current view indicator

- [ ] **Zoom Controls**
  - Zoom in/out buttons
  - Mouse wheel zoom
  - Zoom to fit
  - Zoom to selection

- [ ] **Multi-Select**
  - Click + drag to select multiple nodes
  - Shift+click for multi-select
  - Bulk operations (delete, move, copy)

- [ ] **Copy/Paste**
  - Copy selected nodes
  - Paste with offset
  - Duplicate nodes
  - Copy connections

- [ ] **Undo/Redo**
  - Action history
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  - Visual undo/redo buttons

### Phase 2: Navigation & Organization (Medium Priority)
- [ ] **Node Search/Filter**
  - Search by node ID, content, speaker
  - Filter by node type
  - Filter by flags used
  - Highlight search results

- [ ] **Node Grouping/Folders**
  - Group related nodes
  - Collapse/expand groups
  - Visual grouping indicators
  - Move groups together

- [ ] **Better Edge Routing**
  - Smart edge paths (avoid nodes)
  - Curved edges
  - Edge labels
  - Edge colors by type

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

### Immediate (Next Sprint)
1. Conditional blocks support
2. Variables system
3. Minimap
4. Zoom controls
5. Multi-select

### Short Term (Next Month)
1. Copy/paste
2. Undo/redo
3. Advanced set operations
4. Node search/filter
5. Better edge routing

### Medium Term (Next Quarter)
1. Commands support
2. Shortcuts
3. Tags system
4. Node grouping
5. Node alignment tools

### Long Term (Future)
1. Functions
2. Localization
3. Node templates
4. Performance optimizations
5. Advanced visual features

## Technical Considerations

### Data Structure Updates
- Add `ConditionalNode` type for if/else blocks
- Add `CommandNode` type for commands
- Extend `DialogueNode` with variable support
- Add `VariableDefinition` to schema

### UI Components Needed
- ConditionalNodeEditor
- VariableManager
- Minimap component
- ZoomControls component
- MultiSelectHandler
- UndoRedoManager

### Yarn Converter Updates
- Parse conditional blocks
- Parse variables
- Parse commands
- Parse shortcuts
- Export all new features


