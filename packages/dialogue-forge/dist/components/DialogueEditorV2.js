"use strict";
/**
 * Dialogue Editor V2 - React Flow Implementation
 *
 * This is the new version using React Flow for graph rendering.
 * See V2_MIGRATION_PLAN.md for implementation details.
 */
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
exports.DialogueEditorV2 = DialogueEditorV2;
const react_1 = __importStar(require("react"));
const reactflow_1 = __importStar(require("reactflow"));
const lucide_react_1 = require("lucide-react");
require("reactflow/dist/style.css");
const yarn_converter_1 = require("../lib/yarn-converter");
const reactflow_converter_1 = require("../utils/reactflow-converter");
const node_helpers_1 = require("../utils/node-helpers");
const layout_1 = require("../utils/layout");
const NodeEditor_1 = require("./NodeEditor");
const YarnView_1 = require("./YarnView");
const PlayView_1 = require("./PlayView");
const NPCNodeV2_1 = require("./NPCNodeV2");
const PlayerNodeV2_1 = require("./PlayerNodeV2");
const ConditionalNodeV2_1 = require("./ConditionalNodeV2");
const ChoiceEdgeV2_1 = require("./ChoiceEdgeV2");
const NPCEdgeV2_1 = require("./NPCEdgeV2");
// Define node and edge types outside component for stability
const nodeTypes = {
    npc: NPCNodeV2_1.NPCNodeV2,
    player: PlayerNodeV2_1.PlayerNodeV2,
    conditional: ConditionalNodeV2_1.ConditionalNodeV2,
};
const edgeTypes = {
    choice: ChoiceEdgeV2_1.ChoiceEdgeV2,
    default: NPCEdgeV2_1.NPCEdgeV2, // Use custom component for NPC edges instead of React Flow default
};
function DialogueEditorV2Internal({ dialogue, onChange, onExportYarn, onExportJSON, className = '', showTitleEditor = true, flagSchema, initialViewMode = 'graph', layoutStrategy: propLayoutStrategy = 'dagre', // Accept from parent
onLayoutStrategyChange, onOpenFlagManager, onOpenGuide, }) {
    const [viewMode, setViewMode] = (0, react_1.useState)(initialViewMode);
    const [layoutDirection, setLayoutDirection] = (0, react_1.useState)('TB');
    const layoutStrategy = propLayoutStrategy; // Use prop instead of state
    const [autoOrganize, setAutoOrganize] = (0, react_1.useState)(false); // Auto-layout on changes
    const [showPathHighlight, setShowPathHighlight] = (0, react_1.useState)(true); // Toggle path highlighting
    const [showBackEdges, setShowBackEdges] = (0, react_1.useState)(true); // Toggle back-edge styling
    const [showLayoutMenu, setShowLayoutMenu] = (0, react_1.useState)(false);
    // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
    const memoizedNodeTypes = (0, react_1.useMemo)(() => nodeTypes, []);
    const memoizedEdgeTypes = (0, react_1.useMemo)(() => edgeTypes, []);
    const [selectedNodeId, setSelectedNodeId] = (0, react_1.useState)(null);
    const [contextMenu, setContextMenu] = (0, react_1.useState)(null);
    const [nodeContextMenu, setNodeContextMenu] = (0, react_1.useState)(null);
    const [edgeContextMenu, setEdgeContextMenu] = (0, react_1.useState)(null);
    const [edgeDropMenu, setEdgeDropMenu] = (0, react_1.useState)(null);
    const reactFlowInstance = (0, reactflow_1.useReactFlow)();
    const connectingRef = (0, react_1.useRef)(null);
    // Convert DialogueTree to React Flow format
    const { nodes: initialNodes, edges: initialEdges } = (0, react_1.useMemo)(() => dialogue ? (0, reactflow_converter_1.convertDialogueTreeToReactFlow)(dialogue, layoutDirection) : { nodes: [], edges: [] }, [dialogue, layoutDirection]);
    const [nodes, setNodes] = (0, react_1.useState)(initialNodes);
    const [edges, setEdges] = (0, react_1.useState)(initialEdges);
    // Find all edges that lead to the selected node by tracing FORWARD from start
    // This avoids including back-edges and only shows the actual forward path
    const { edgesToSelectedNode, nodeDepths } = (0, react_1.useMemo)(() => {
        if (!selectedNodeId || !dialogue || !dialogue.startNodeId) {
            return { edgesToSelectedNode: new Set(), nodeDepths: new Map() };
        }
        // Step 1: Find all forward paths from start that reach the selected node
        // Use DFS to trace forward, tracking the path
        const nodesOnPath = new Set();
        const edgesOnPath = new Set();
        const nodeDepthMap = new Map();
        // DFS that returns true if this path leads to the selected node
        const findPathToTarget = (currentNodeId, visitedInPath, depth) => {
            // Found the target!
            if (currentNodeId === selectedNodeId) {
                nodesOnPath.add(currentNodeId);
                nodeDepthMap.set(currentNodeId, depth);
                return true;
            }
            // Avoid cycles in THIS path (back-edges)
            if (visitedInPath.has(currentNodeId)) {
                return false;
            }
            const node = dialogue.nodes[currentNodeId];
            if (!node)
                return false;
            visitedInPath.add(currentNodeId);
            let foundPath = false;
            // Check NPC nextNodeId
            if (node.nextNodeId && dialogue.nodes[node.nextNodeId]) {
                if (findPathToTarget(node.nextNodeId, new Set(visitedInPath), depth + 1)) {
                    foundPath = true;
                    edgesOnPath.add(`${currentNodeId}-next`);
                }
            }
            // Check player choices
            if (node.choices) {
                node.choices.forEach((choice, idx) => {
                    if (choice.nextNodeId && dialogue.nodes[choice.nextNodeId]) {
                        if (findPathToTarget(choice.nextNodeId, new Set(visitedInPath), depth + 1)) {
                            foundPath = true;
                            edgesOnPath.add(`${currentNodeId}-choice-${idx}`);
                        }
                    }
                });
            }
            // Check conditional blocks
            if (node.conditionalBlocks) {
                node.conditionalBlocks.forEach((block, idx) => {
                    if (block.nextNodeId && dialogue.nodes[block.nextNodeId]) {
                        if (findPathToTarget(block.nextNodeId, new Set(visitedInPath), depth + 1)) {
                            foundPath = true;
                            edgesOnPath.add(`${currentNodeId}-block-${idx}`);
                        }
                    }
                });
            }
            // If any path from this node leads to target, include this node
            if (foundPath) {
                nodesOnPath.add(currentNodeId);
                // Keep the minimum depth (closest to start)
                if (!nodeDepthMap.has(currentNodeId) || nodeDepthMap.get(currentNodeId) > depth) {
                    nodeDepthMap.set(currentNodeId, depth);
                }
            }
            return foundPath;
        };
        // Start the search from the dialogue's start node
        findPathToTarget(dialogue.startNodeId, new Set(), 0);
        return { edgesToSelectedNode: edgesOnPath, nodeDepths: nodeDepthMap };
    }, [selectedNodeId, dialogue]);
    // Update nodes/edges when dialogue changes externally
    react_1.default.useEffect(() => {
        if (dialogue) {
            const { nodes: newNodes, edges: newEdges } = (0, reactflow_converter_1.convertDialogueTreeToReactFlow)(dialogue, layoutDirection);
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [dialogue]);
    // Calculate end nodes (nodes with no outgoing connections)
    const endNodeIds = (0, react_1.useMemo)(() => {
        if (!dialogue)
            return new Set();
        const ends = new Set();
        Object.values(dialogue.nodes).forEach(node => {
            const hasNextNode = !!node.nextNodeId;
            const hasChoiceConnections = node.choices?.some(c => c.nextNodeId) || false;
            const hasBlockConnections = node.conditionalBlocks?.some(b => b.nextNodeId) || false;
            if (!hasNextNode && !hasChoiceConnections && !hasBlockConnections) {
                ends.add(node.id);
            }
        });
        return ends;
    }, [dialogue]);
    // Add flagSchema, dim state, and layout direction to node data
    const nodesWithFlags = (0, react_1.useMemo)(() => {
        const hasSelection = selectedNodeId !== null && showPathHighlight;
        const startNodeId = dialogue?.startNodeId;
        return nodes.map(node => {
            const isInPath = showPathHighlight && nodeDepths.has(node.id);
            const isSelected = node.id === selectedNodeId;
            // Dim nodes that aren't in the path when something is selected (only if path highlight is on)
            const isDimmed = hasSelection && !isInPath && !isSelected;
            const isStartNode = node.id === startNodeId;
            const isEndNode = endNodeIds.has(node.id);
            return {
                ...node,
                data: {
                    ...node.data,
                    flagSchema,
                    isDimmed,
                    isInPath,
                    layoutDirection,
                    isStartNode,
                    isEndNode,
                },
            };
        });
    }, [nodes, flagSchema, nodeDepths, selectedNodeId, layoutDirection, showPathHighlight, dialogue, endNodeIds]);
    if (!dialogue) {
        return (react_1.default.createElement("div", { className: `dialogue-editor-v2-empty ${className}` },
            react_1.default.createElement("p", null, "No dialogue loaded. Please provide a dialogue tree.")));
    }
    // Get selected node - use useMemo to ensure it updates when dialogue changes
    const selectedNode = (0, react_1.useMemo)(() => {
        if (!selectedNodeId || !dialogue)
            return null;
        const node = dialogue.nodes[selectedNodeId];
        if (!node)
            return null;
        // Return a fresh copy to ensure React detects changes
        return {
            ...node,
            choices: node.choices ? node.choices.map(c => ({ ...c })) : undefined,
            setFlags: node.setFlags ? [...node.setFlags] : undefined,
            conditionalBlocks: node.conditionalBlocks ? node.conditionalBlocks.map(b => ({
                ...b,
                condition: b.condition ? [...b.condition] : undefined,
            })) : undefined,
        };
    }, [selectedNodeId, dialogue]);
    // Handle node deletion (multi-delete support)
    const onNodesDelete = (0, react_1.useCallback)((deleted) => {
        let updatedNodes = { ...dialogue.nodes };
        let shouldClearSelection = false;
        deleted.forEach(node => {
            delete updatedNodes[node.id];
            if (selectedNodeId === node.id) {
                shouldClearSelection = true;
            }
        });
        let newDialogue = { ...dialogue, nodes: updatedNodes };
        // Auto-organize if enabled
        if (autoOrganize) {
            const result = (0, layout_1.applyLayout)(newDialogue, layoutStrategy, { direction: layoutDirection });
            newDialogue = result.dialogue;
            setTimeout(() => {
                if (reactFlowInstance) {
                    reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
                }
            }, 50);
        }
        onChange(newDialogue);
        if (shouldClearSelection) {
            setSelectedNodeId(null);
        }
    }, [dialogue, onChange, selectedNodeId, autoOrganize, layoutDirection, reactFlowInstance]);
    // Handle node changes (drag, delete, etc.)
    const onNodesChange = (0, react_1.useCallback)((changes) => {
        setNodes((nds) => (0, reactflow_1.applyNodeChanges)(changes, nds));
        // Handle deletions (backup in case onNodesDelete doesn't fire)
        const deletions = changes.filter(c => c.type === 'remove');
        if (deletions.length > 0) {
            let updatedNodes = { ...dialogue.nodes };
            let shouldClearSelection = false;
            deletions.forEach(change => {
                if (change.type === 'remove') {
                    delete updatedNodes[change.id];
                    if (selectedNodeId === change.id) {
                        shouldClearSelection = true;
                    }
                }
            });
            onChange({ ...dialogue, nodes: updatedNodes });
            if (shouldClearSelection) {
                setSelectedNodeId(null);
            }
        }
        // Sync position changes back to DialogueTree
        changes.forEach(change => {
            if (change.type === 'position' && change.position) {
                const node = dialogue.nodes[change.id];
                if (node && (node.x !== change.position.x || node.y !== change.position.y)) {
                    // Create a new node object to avoid mutating the original
                    const updatedNode = {
                        ...dialogue.nodes[change.id],
                        x: change.position.x,
                        y: change.position.y,
                    };
                    onChange({
                        ...dialogue,
                        nodes: {
                            ...dialogue.nodes,
                            [change.id]: updatedNode,
                        },
                    });
                }
            }
        });
    }, [dialogue, onChange, selectedNodeId]);
    // Handle edge changes (delete, etc.)
    const onEdgesChange = (0, react_1.useCallback)((changes) => {
        setEdges((eds) => (0, reactflow_1.applyEdgeChanges)(changes, eds));
        // Sync edge deletions back to DialogueTree
        changes.forEach(change => {
            if (change.type === 'remove') {
                // Find the edge before it's removed
                const currentEdges = edges;
                const edge = currentEdges.find(e => e.id === change.id);
                if (edge) {
                    const sourceNode = dialogue.nodes[edge.source];
                    if (sourceNode) {
                        if (edge.sourceHandle === 'next' && sourceNode.type === 'npc') {
                            // Remove NPC next connection
                            onChange({
                                ...dialogue,
                                nodes: {
                                    ...dialogue.nodes,
                                    [edge.source]: {
                                        ...sourceNode,
                                        nextNodeId: undefined,
                                    },
                                },
                            });
                        }
                        else if (edge.sourceHandle?.startsWith('choice-')) {
                            // Remove Player choice connection
                            const choiceIdx = parseInt(edge.sourceHandle.replace('choice-', ''));
                            if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
                                const updated = (0, node_helpers_1.updateChoiceInNode)(sourceNode, choiceIdx, { nextNodeId: '' });
                                onChange({
                                    ...dialogue,
                                    nodes: {
                                        ...dialogue.nodes,
                                        [edge.source]: updated,
                                    },
                                });
                            }
                        }
                        else if (edge.sourceHandle?.startsWith('block-') && sourceNode.type === 'conditional') {
                            // Remove Conditional block connection
                            const blockIdx = parseInt(edge.sourceHandle.replace('block-', ''));
                            if (sourceNode.conditionalBlocks && sourceNode.conditionalBlocks[blockIdx]) {
                                const updatedBlocks = [...sourceNode.conditionalBlocks];
                                updatedBlocks[blockIdx] = {
                                    ...updatedBlocks[blockIdx],
                                    nextNodeId: undefined,
                                };
                                onChange({
                                    ...dialogue,
                                    nodes: {
                                        ...dialogue.nodes,
                                        [edge.source]: {
                                            ...sourceNode,
                                            conditionalBlocks: updatedBlocks,
                                        },
                                    },
                                });
                            }
                        }
                    }
                }
            }
        });
    }, [dialogue, onChange, edges]);
    // Handle edge deletion (when Delete key is pressed on selected edges)
    const onEdgesDelete = (0, react_1.useCallback)((deletedEdges) => {
        deletedEdges.forEach(edge => {
            const sourceNode = dialogue.nodes[edge.source];
            if (sourceNode) {
                if (edge.sourceHandle === 'next' && sourceNode.type === 'npc') {
                    // Remove NPC next connection
                    onChange({
                        ...dialogue,
                        nodes: {
                            ...dialogue.nodes,
                            [edge.source]: {
                                ...sourceNode,
                                nextNodeId: undefined,
                            },
                        },
                    });
                }
                else if (edge.sourceHandle?.startsWith('choice-')) {
                    // Remove Player choice connection
                    const choiceIdx = parseInt(edge.sourceHandle.replace('choice-', ''));
                    if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
                        const updated = (0, node_helpers_1.updateChoiceInNode)(sourceNode, choiceIdx, { nextNodeId: '' });
                        onChange({
                            ...dialogue,
                            nodes: {
                                ...dialogue.nodes,
                                [edge.source]: updated,
                            },
                        });
                    }
                }
                else if (edge.sourceHandle?.startsWith('block-') && sourceNode.type === 'conditional') {
                    // Remove Conditional block connection
                    const blockIdx = parseInt(edge.sourceHandle.replace('block-', ''));
                    if (sourceNode.conditionalBlocks && sourceNode.conditionalBlocks[blockIdx]) {
                        const updatedBlocks = [...sourceNode.conditionalBlocks];
                        updatedBlocks[blockIdx] = {
                            ...updatedBlocks[blockIdx],
                            nextNodeId: undefined,
                        };
                        onChange({
                            ...dialogue,
                            nodes: {
                                ...dialogue.nodes,
                                [edge.source]: {
                                    ...sourceNode,
                                    conditionalBlocks: updatedBlocks,
                                },
                            },
                        });
                    }
                }
            }
        });
    }, [dialogue, onChange]);
    // Handle connection start (track what we're connecting from)
    const onConnectStart = (0, react_1.useCallback)((_event, { nodeId, handleId }) => {
        if (!nodeId)
            return;
        const sourceNode = dialogue.nodes[nodeId];
        if (!sourceNode)
            return;
        if (handleId === 'next' && sourceNode.type === 'npc') {
            connectingRef.current = { fromNodeId: nodeId, sourceHandle: 'next' };
        }
        else if (handleId?.startsWith('choice-')) {
            const choiceIdx = parseInt(handleId.replace('choice-', ''));
            connectingRef.current = { fromNodeId: nodeId, fromChoiceIdx: choiceIdx, sourceHandle: handleId };
        }
        else if (handleId?.startsWith('block-')) {
            const blockIdx = parseInt(handleId.replace('block-', ''));
            connectingRef.current = { fromNodeId: nodeId, fromBlockIdx: blockIdx, sourceHandle: handleId };
        }
    }, [dialogue]);
    // Handle connection end (check if dropped on empty space)
    const onConnectEnd = (0, react_1.useCallback)((event) => {
        if (!connectingRef.current)
            return;
        const targetIsNode = event.target.closest('.react-flow__node');
        if (!targetIsNode) {
            // Dropped on empty space - show edge drop menu
            const clientX = 'clientX' in event ? event.clientX : (event.touches?.[0]?.clientX || 0);
            const clientY = 'clientY' in event ? event.clientY : (event.touches?.[0]?.clientY || 0);
            const point = reactFlowInstance.screenToFlowPosition({
                x: clientX,
                y: clientY,
            });
            setEdgeDropMenu({
                x: clientX,
                y: clientY,
                graphX: point.x,
                graphY: point.y,
                fromNodeId: connectingRef.current.fromNodeId,
                fromChoiceIdx: connectingRef.current.fromChoiceIdx,
                fromBlockIdx: connectingRef.current.fromBlockIdx,
                sourceHandle: connectingRef.current.sourceHandle,
            });
        }
        connectingRef.current = null;
    }, [reactFlowInstance]);
    // Handle new connections
    const onConnect = (0, react_1.useCallback)((connection) => {
        if (!connection.source || !connection.target)
            return;
        const newEdge = (0, reactflow_1.addEdge)(connection, edges);
        setEdges(newEdge);
        setEdgeDropMenu(null); // Close edge drop menu if open
        // Update DialogueTree
        const sourceNode = dialogue.nodes[connection.source];
        if (!sourceNode)
            return;
        if (connection.sourceHandle === 'next' && sourceNode.type === 'npc') {
            // NPC next connection
            onChange({
                ...dialogue,
                nodes: {
                    ...dialogue.nodes,
                    [connection.source]: {
                        ...sourceNode,
                        nextNodeId: connection.target,
                    },
                },
            });
        }
        else if (connection.sourceHandle?.startsWith('choice-')) {
            // Player choice connection
            const choiceIdx = parseInt(connection.sourceHandle.replace('choice-', ''));
            if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
                const updated = (0, node_helpers_1.updateChoiceInNode)(sourceNode, choiceIdx, { nextNodeId: connection.target });
                onChange({
                    ...dialogue,
                    nodes: {
                        ...dialogue.nodes,
                        [connection.source]: updated,
                    },
                });
            }
        }
        else if (connection.sourceHandle?.startsWith('block-') && sourceNode.type === 'conditional') {
            // Conditional block connection
            const blockIdx = parseInt(connection.sourceHandle.replace('block-', ''));
            if (sourceNode.conditionalBlocks && sourceNode.conditionalBlocks[blockIdx]) {
                const updatedBlocks = [...sourceNode.conditionalBlocks];
                updatedBlocks[blockIdx] = {
                    ...updatedBlocks[blockIdx],
                    nextNodeId: connection.target,
                };
                onChange({
                    ...dialogue,
                    nodes: {
                        ...dialogue.nodes,
                        [connection.source]: {
                            ...sourceNode,
                            conditionalBlocks: updatedBlocks,
                        },
                    },
                });
            }
        }
        connectingRef.current = null;
    }, [dialogue, onChange, edges]);
    // Handle node selection
    const onNodeClick = (0, react_1.useCallback)((_event, node) => {
        setSelectedNodeId(node.id);
        setNodeContextMenu(null);
    }, []);
    // Handle pane context menu (right-click on empty space)
    const onPaneContextMenu = (0, react_1.useCallback)((event) => {
        event.preventDefault();
        const point = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            graphX: point.x,
            graphY: point.y,
        });
    }, [reactFlowInstance]);
    // Handle node context menu
    const onNodeContextMenu = (0, react_1.useCallback)((event, node) => {
        event.preventDefault();
        setNodeContextMenu({
            x: event.clientX,
            y: event.clientY,
            nodeId: node.id,
        });
        setContextMenu(null);
    }, []);
    // Handle edge context menu (right-click on edge to insert node)
    const onEdgeContextMenu = (0, react_1.useCallback)((event, edge) => {
        event.preventDefault();
        // Calculate midpoint position on the edge
        const sourceNodePosition = nodes.find(n => n.id === edge.source)?.position;
        const targetNodePosition = nodes.find(n => n.id === edge.target)?.position;
        if (!sourceNodePosition || !targetNodePosition)
            return;
        // Calculate midpoint in flow coordinates
        const midX = (sourceNodePosition.x + targetNodePosition.x) / 2;
        const midY = (sourceNodePosition.y + targetNodePosition.y) / 2;
        // Convert to screen coordinates for menu positioning
        const point = reactFlowInstance.flowToScreenPosition({ x: midX, y: midY });
        setEdgeContextMenu({
            x: point.x,
            y: point.y,
            edgeId: edge.id,
            graphX: midX,
            graphY: midY,
        });
        setContextMenu(null);
        setNodeContextMenu(null);
    }, [nodes, reactFlowInstance]);
    // Insert node between two connected nodes
    const handleInsertNode = (0, react_1.useCallback)((type, edgeId, x, y) => {
        // Find the edge
        const edge = edges.find(e => e.id === edgeId);
        if (!edge)
            return;
        // Get the source and target nodes
        const sourceNode = dialogue.nodes[edge.source];
        const targetNode = dialogue.nodes[edge.target];
        if (!sourceNode || !targetNode)
            return;
        // Create new node
        const newId = `${type}_${Date.now()}`;
        const newNode = (0, node_helpers_1.createNode)(type, newId, x, y);
        // Update dialogue tree: break old connection, add new node, connect source->new->target
        const updatedNodes = { ...dialogue.nodes, [newId]: newNode };
        // Break the old connection and reconnect through new node
        if (edge.sourceHandle === 'next' && sourceNode.type === 'npc') {
            // NPC connection
            updatedNodes[edge.source] = {
                ...sourceNode,
                nextNodeId: newId, // Connect source to new node
            };
            updatedNodes[newId] = {
                ...newNode,
                nextNodeId: edge.target, // Connect new node to target
            };
        }
        else if (edge.sourceHandle?.startsWith('choice-')) {
            // Player choice connection
            const choiceIdx = parseInt(edge.sourceHandle.replace('choice-', ''));
            if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
                const updatedChoices = [...sourceNode.choices];
                updatedChoices[choiceIdx] = {
                    ...updatedChoices[choiceIdx],
                    nextNodeId: newId, // Connect choice to new node
                };
                updatedNodes[edge.source] = {
                    ...sourceNode,
                    choices: updatedChoices,
                };
                updatedNodes[newId] = {
                    ...newNode,
                    nextNodeId: edge.target, // Connect new node to target
                };
            }
        }
        else if (edge.sourceHandle?.startsWith('block-')) {
            // Conditional block connection
            const blockIdx = parseInt(edge.sourceHandle.replace('block-', ''));
            if (sourceNode.conditionalBlocks && sourceNode.conditionalBlocks[blockIdx]) {
                const updatedBlocks = [...sourceNode.conditionalBlocks];
                updatedBlocks[blockIdx] = {
                    ...updatedBlocks[blockIdx],
                    nextNodeId: newId, // Connect block to new node
                };
                updatedNodes[edge.source] = {
                    ...sourceNode,
                    conditionalBlocks: updatedBlocks,
                };
                updatedNodes[newId] = {
                    ...newNode,
                    nextNodeId: edge.target, // Connect new node to target
                };
            }
        }
        onChange({
            ...dialogue,
            nodes: updatedNodes,
        });
        setEdgeContextMenu(null);
    }, [dialogue, onChange, edges]);
    // Add node from context menu or edge drop
    const handleAddNode = (0, react_1.useCallback)((type, x, y, autoConnect) => {
        const newId = `${type}_${Date.now()}`;
        const newNode = (0, node_helpers_1.createNode)(type, newId, x, y);
        // Build the complete new dialogue state in one go
        let newDialogue = {
            ...dialogue,
            nodes: { ...dialogue.nodes, [newId]: newNode }
        };
        // If auto-connecting, include that connection
        if (autoConnect) {
            const sourceNode = dialogue.nodes[autoConnect.fromNodeId];
            if (sourceNode) {
                if (autoConnect.sourceHandle === 'next' && sourceNode.type === 'npc') {
                    newDialogue.nodes[autoConnect.fromNodeId] = { ...sourceNode, nextNodeId: newId };
                }
                else if (autoConnect.fromChoiceIdx !== undefined && sourceNode.choices) {
                    const newChoices = [...sourceNode.choices];
                    newChoices[autoConnect.fromChoiceIdx] = { ...newChoices[autoConnect.fromChoiceIdx], nextNodeId: newId };
                    newDialogue.nodes[autoConnect.fromNodeId] = { ...sourceNode, choices: newChoices };
                }
                else if (autoConnect.fromBlockIdx !== undefined && sourceNode.type === 'conditional' && sourceNode.conditionalBlocks) {
                    const newBlocks = [...sourceNode.conditionalBlocks];
                    newBlocks[autoConnect.fromBlockIdx] = { ...newBlocks[autoConnect.fromBlockIdx], nextNodeId: newId };
                    newDialogue.nodes[autoConnect.fromNodeId] = { ...sourceNode, conditionalBlocks: newBlocks };
                }
            }
        }
        // Apply layout if auto-organize is enabled
        if (autoOrganize) {
            const result = (0, layout_1.applyLayout)(newDialogue, layoutStrategy, { direction: layoutDirection });
            newDialogue = result.dialogue;
        }
        // Single onChange call with all updates
        onChange(newDialogue);
        setSelectedNodeId(newId);
        setContextMenu(null);
        setEdgeDropMenu(null);
        connectingRef.current = null;
        // Fit view after layout (only if auto-organize is on)
        if (autoOrganize) {
            setTimeout(() => {
                if (reactFlowInstance) {
                    reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
                }
            }, 50);
        }
    }, [dialogue, onChange, autoOrganize, layoutDirection, reactFlowInstance]);
    // Handle node updates
    const handleUpdateNode = (0, react_1.useCallback)((nodeId, updates) => {
        onChange({
            ...dialogue,
            nodes: {
                ...dialogue.nodes,
                [nodeId]: { ...dialogue.nodes[nodeId], ...updates }
            }
        });
    }, [dialogue, onChange]);
    // Handle choice updates
    const handleAddChoice = (0, react_1.useCallback)((nodeId) => {
        const updated = (0, node_helpers_1.addChoiceToNode)(dialogue.nodes[nodeId]);
        handleUpdateNode(nodeId, updated);
    }, [dialogue, handleUpdateNode]);
    const handleUpdateChoice = (0, react_1.useCallback)((nodeId, choiceIdx, updates) => {
        const updated = (0, node_helpers_1.updateChoiceInNode)(dialogue.nodes[nodeId], choiceIdx, updates);
        handleUpdateNode(nodeId, updated);
    }, [dialogue, handleUpdateNode]);
    const handleRemoveChoice = (0, react_1.useCallback)((nodeId, choiceIdx) => {
        const updated = (0, node_helpers_1.removeChoiceFromNode)(dialogue.nodes[nodeId], choiceIdx);
        handleUpdateNode(nodeId, updated);
    }, [dialogue, handleUpdateNode]);
    const handleDeleteNode = (0, react_1.useCallback)((nodeId) => {
        try {
            let newDialogue = (0, node_helpers_1.deleteNodeFromTree)(dialogue, nodeId);
            // Auto-organize if enabled
            if (autoOrganize) {
                const result = (0, layout_1.applyLayout)(newDialogue, layoutStrategy, { direction: layoutDirection });
                newDialogue = result.dialogue;
                setTimeout(() => {
                    if (reactFlowInstance) {
                        reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
                    }
                }, 50);
            }
            onChange(newDialogue);
            setSelectedNodeId(null);
        }
        catch (e) {
            alert(e.message);
        }
    }, [dialogue, onChange, autoOrganize, layoutDirection, reactFlowInstance]);
    // Handle node drag stop - resolve collisions in freeform mode
    const onNodeDragStop = (0, react_1.useCallback)((event, node) => {
        // In freeform mode, resolve collisions after drag
        if (!autoOrganize) {
            const collisionResolved = (0, layout_1.resolveNodeCollisions)(dialogue, {
                maxIterations: 50,
                overlapThreshold: 0.3,
                margin: 20,
            });
            // Only update if positions actually changed
            const hasChanges = Object.keys(collisionResolved.nodes).some(id => {
                const orig = dialogue.nodes[id];
                const resolved = collisionResolved.nodes[id];
                return orig && resolved && (orig.x !== resolved.x || orig.y !== resolved.y);
            });
            if (hasChanges) {
                onChange(collisionResolved);
            }
        }
    }, [dialogue, onChange, autoOrganize]);
    // Handle auto-layout with direction (strategy comes from prop)
    const handleAutoLayout = (0, react_1.useCallback)((direction) => {
        const dir = direction || layoutDirection;
        if (direction) {
            setLayoutDirection(direction);
        }
        const result = (0, layout_1.applyLayout)(dialogue, layoutStrategy, { direction: dir });
        onChange(result.dialogue);
        // Fit view after a short delay to allow React Flow to update
        setTimeout(() => {
            if (reactFlowInstance) {
                reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
            }
        }, 100);
    }, [dialogue, onChange, reactFlowInstance, layoutDirection, layoutStrategy]);
    return (react_1.default.createElement("div", { className: `dialogue-editor-v2 ${className} w-full h-full flex flex-col` },
        viewMode === 'graph' && (react_1.default.createElement("div", { className: "flex-1 flex overflow-hidden" },
            react_1.default.createElement("div", { className: "flex-1 relative" },
                react_1.default.createElement(reactflow_1.default, { nodes: nodesWithFlags, edges: edges.map(edge => {
                        // Detect back-edges (loops) based on layout direction
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        const targetNode = nodes.find(n => n.id === edge.target);
                        // For TB layout: back-edge if target Y < source Y (going up)
                        // For LR layout: back-edge if target X < source X (going left)
                        const isBackEdge = showBackEdges && sourceNode && targetNode && (layoutDirection === 'TB'
                            ? targetNode.position.y < sourceNode.position.y
                            : targetNode.position.x < sourceNode.position.x);
                        const isInPath = edgesToSelectedNode.has(edge.id);
                        // Dim edges not in the path when path highlighting is on and something is selected
                        const isDimmed = showPathHighlight && selectedNodeId !== null && !isInPath;
                        return {
                            ...edge,
                            data: {
                                ...edge.data,
                                isInPathToSelected: showPathHighlight && isInPath,
                                isBackEdge,
                                isDimmed,
                            },
                        };
                    }), nodeTypes: memoizedNodeTypes, edgeTypes: memoizedEdgeTypes, onNodesChange: onNodesChange, onEdgesChange: onEdgesChange, onNodesDelete: onNodesDelete, onEdgesDelete: onEdgesDelete, onNodeDragStop: onNodeDragStop, nodesDraggable: !autoOrganize, onConnect: onConnect, onConnectStart: onConnectStart, onConnectEnd: onConnectEnd, onNodeClick: onNodeClick, onPaneContextMenu: onPaneContextMenu, onNodeContextMenu: onNodeContextMenu, onEdgeContextMenu: onEdgeContextMenu, onPaneClick: () => {
                        // Close context menus and deselect node when clicking on pane (not nodes)
                        setContextMenu(null);
                        setNodeContextMenu(null);
                        setSelectedNodeId(null);
                        setShowLayoutMenu(false);
                    }, fitView: true, className: "bg-[#0a0a0f]", style: { background: 'radial-gradient(circle, #1a1a2e 1px, #08080c 1px)', backgroundSize: '20px 20px' }, defaultEdgeOptions: { type: 'default' }, connectionLineStyle: { stroke: '#e94560', strokeWidth: 2 }, connectionLineType: reactflow_1.ConnectionLineType.SmoothStep, snapToGrid: false, nodesConnectable: true, elementsSelectable: true, selectionOnDrag: true, panOnDrag: [1, 2], zoomOnScroll: true, zoomOnPinch: true, preventScrolling: true, zoomOnDoubleClick: false, minZoom: 0.1, maxZoom: 3, deleteKeyCode: ['Delete', 'Backspace'], tabIndex: 0 },
                    react_1.default.createElement(reactflow_1.Background, { variant: reactflow_1.BackgroundVariant.Dots, gap: 20, size: 1, color: "#1a1a2e" }),
                    react_1.default.createElement(reactflow_1.Controls, { className: "!bg-[#0d0d14] !border !border-[#2a2a3e] !rounded-lg !shadow-lg", style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            padding: '4px',
                        }, showZoom: true, showFitView: true, showInteractive: false }),
                    react_1.default.createElement(reactflow_1.Panel, { position: "bottom-right", className: "!p-0 !m-2" },
                        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#2a2a3e] rounded-lg overflow-hidden shadow-xl" },
                            react_1.default.createElement("div", { className: "px-3 py-1.5 border-b border-[#2a2a3e] flex items-center justify-between bg-[#12121a]" },
                                react_1.default.createElement("span", { className: "text-[10px] font-medium text-gray-400 uppercase tracking-wider" }, "Overview"),
                                react_1.default.createElement("div", { className: "flex items-center gap-1" },
                                    react_1.default.createElement("span", { className: "w-2 h-2 rounded-full bg-[#e94560]", title: "NPC Node" }),
                                    react_1.default.createElement("span", { className: "w-2 h-2 rounded-full bg-[#8b5cf6]", title: "Player Node" }),
                                    react_1.default.createElement("span", { className: "w-2 h-2 rounded-full bg-blue-500", title: "Conditional" }))),
                            react_1.default.createElement(reactflow_1.MiniMap, { style: {
                                    width: 180,
                                    height: 120,
                                    backgroundColor: '#08080c',
                                }, maskColor: "rgba(0, 0, 0, 0.7)", nodeColor: (node) => {
                                    if (node.type === 'npc')
                                        return '#e94560';
                                    if (node.type === 'player')
                                        return '#8b5cf6';
                                    if (node.type === 'conditional')
                                        return '#3b82f6';
                                    return '#4a4a6a';
                                }, nodeStrokeWidth: 2, pannable: true, zoomable: true }))),
                    react_1.default.createElement(reactflow_1.Panel, { position: "top-left", className: "!bg-transparent !border-0 !p-0 !m-2" },
                        react_1.default.createElement("div", { className: "flex flex-col gap-1.5 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg p-1.5 shadow-lg" },
                            react_1.default.createElement("div", { className: "relative" },
                                react_1.default.createElement("button", { onClick: () => setShowLayoutMenu(!showLayoutMenu), className: `p-1.5 rounded transition-colors ${showLayoutMenu
                                        ? 'bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/50'
                                        : 'bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:text-white hover:border-[#3a3a4e]'}`, title: `Layout: ${(0, layout_1.listLayouts)().find(l => l.id === layoutStrategy)?.name || layoutStrategy}` },
                                    react_1.default.createElement(lucide_react_1.Grid3x3, { size: 14 })),
                                showLayoutMenu && (react_1.default.createElement("div", { className: "absolute left-full ml-2 top-0 z-50 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg shadow-xl p-1 min-w-[200px]" },
                                    react_1.default.createElement("div", { className: "text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 border-b border-[#2a2a3e]" }, "Layout Algorithm"),
                                    (0, layout_1.listLayouts)().map(layout => (react_1.default.createElement("button", { key: layout.id, onClick: () => {
                                            if (onLayoutStrategyChange) {
                                                onLayoutStrategyChange(layout.id);
                                                setShowLayoutMenu(false);
                                                // Trigger layout update with new strategy
                                                setTimeout(() => handleAutoLayout(), 0);
                                            }
                                        }, className: `w-full text-left px-3 py-2 text-sm rounded transition-colors ${layoutStrategy === layout.id
                                            ? 'bg-[#e94560]/20 text-[#e94560]'
                                            : 'text-gray-300 hover:bg-[#1a1a2e]'}` },
                                        react_1.default.createElement("div", { className: "font-medium" },
                                            layout.name,
                                            " ",
                                            layout.isDefault && '(default)'),
                                        react_1.default.createElement("div", { className: "text-[10px] text-gray-500 mt-0.5" }, layout.description))))))),
                            onOpenFlagManager && (react_1.default.createElement("button", { onClick: onOpenFlagManager, className: "p-1.5 bg-[#12121a] border border-[#2a2a3e] rounded text-gray-400 hover:text-white hover:border-[#3a3a4e] transition-colors", title: "Manage Flags" },
                                react_1.default.createElement(lucide_react_1.Settings, { size: 14 }))),
                            onOpenGuide && (react_1.default.createElement("button", { onClick: onOpenGuide, className: "p-1.5 bg-[#12121a] border border-[#2a2a3e] rounded text-gray-400 hover:text-white hover:border-[#3a3a4e] transition-colors", title: "Guide & Documentation" },
                                react_1.default.createElement(lucide_react_1.BookOpen, { size: 14 }))))),
                    react_1.default.createElement(reactflow_1.Panel, { position: "top-right", className: "!bg-transparent !border-0 !p-0 !m-2" },
                        react_1.default.createElement("div", { className: "flex items-center gap-1.5 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg p-1.5 shadow-lg" },
                            react_1.default.createElement("button", { onClick: () => {
                                    const newAutoOrganize = !autoOrganize;
                                    setAutoOrganize(newAutoOrganize);
                                    // If turning on, immediately apply layout
                                    if (newAutoOrganize) {
                                        handleAutoLayout();
                                    }
                                }, className: `p-1.5 rounded transition-colors ${autoOrganize
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                    : 'bg-[#12121a] text-gray-500 hover:text-gray-300 border border-[#2a2a3e]'}`, title: autoOrganize ? `Auto Layout ON - Nodes auto-arrange` : "Auto Layout OFF - Free placement" },
                                react_1.default.createElement(lucide_react_1.Magnet, { size: 14 })),
                            react_1.default.createElement("div", { className: "w-px h-5 bg-[#2a2a3e]" }),
                            react_1.default.createElement("div", { className: "flex border border-[#2a2a3e] rounded overflow-hidden" },
                                react_1.default.createElement("button", { onClick: () => handleAutoLayout('TB'), className: `p-1.5 transition-colors ${layoutDirection === 'TB'
                                        ? 'bg-[#e94560]/20 text-[#e94560]'
                                        : 'bg-[#12121a] text-gray-500 hover:text-gray-300'} border-r border-[#2a2a3e]`, title: "Vertical Layout (Top to Bottom)" },
                                    react_1.default.createElement(lucide_react_1.ArrowDown, { size: 14 })),
                                react_1.default.createElement("button", { onClick: () => handleAutoLayout('LR'), className: `p-1.5 transition-colors ${layoutDirection === 'LR'
                                        ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
                                        : 'bg-[#12121a] text-gray-500 hover:text-gray-300'}`, title: "Horizontal Layout (Left to Right)" },
                                    react_1.default.createElement(lucide_react_1.ArrowRight, { size: 14 }))),
                            react_1.default.createElement("button", { onClick: () => handleAutoLayout(), className: "p-1.5 bg-[#12121a] border border-[#2a2a3e] rounded text-gray-400 hover:text-white hover:border-[#3a3a4e] transition-colors", title: "Re-apply Layout" },
                                react_1.default.createElement(lucide_react_1.Layout, { size: 14 })),
                            react_1.default.createElement("div", { className: "w-px h-5 bg-[#2a2a3e]" }),
                            react_1.default.createElement("button", { onClick: () => setShowPathHighlight(!showPathHighlight), className: `p-1.5 rounded transition-colors ${showPathHighlight
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                    : 'bg-[#12121a] text-gray-500 hover:text-gray-300 border border-[#2a2a3e]'}`, title: showPathHighlight ? "Path Highlight ON" : "Path Highlight OFF" },
                                react_1.default.createElement(lucide_react_1.Sparkles, { size: 14 })),
                            react_1.default.createElement("button", { onClick: () => setShowBackEdges(!showBackEdges), className: `p-1.5 rounded transition-colors ${showBackEdges
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                    : 'bg-[#12121a] text-gray-500 hover:text-gray-300 border border-[#2a2a3e]'}`, title: showBackEdges ? "Loop Edges Styled" : "Loop Edges Normal" },
                                react_1.default.createElement(lucide_react_1.Undo2, { size: 14 })),
                            react_1.default.createElement("div", { className: "w-px h-5 bg-[#2a2a3e]" }),
                            react_1.default.createElement("button", { onClick: () => {
                                    if (dialogue?.startNodeId) {
                                        setSelectedNodeId(dialogue.startNodeId);
                                        // Center on start node
                                        const startNode = nodes.find(n => n.id === dialogue.startNodeId);
                                        if (startNode && reactFlowInstance) {
                                            reactFlowInstance.setCenter(startNode.position.x + 110, startNode.position.y + 60, { zoom: 1, duration: 500 });
                                        }
                                    }
                                }, className: "p-1.5 bg-green-500/20 text-green-400 border border-green-500/50 rounded transition-colors hover:bg-green-500/30", title: "Go to Start Node" },
                                react_1.default.createElement(lucide_react_1.Home, { size: 14 })),
                            react_1.default.createElement("button", { onClick: () => {
                                    const endNodes = Array.from(endNodeIds);
                                    if (endNodes.length > 0) {
                                        // Cycle through end nodes or select first one
                                        const currentIdx = selectedNodeId ? endNodes.indexOf(selectedNodeId) : -1;
                                        const nextIdx = (currentIdx + 1) % endNodes.length;
                                        const nextEndNodeId = endNodes[nextIdx];
                                        setSelectedNodeId(nextEndNodeId);
                                        // Center on end node
                                        const endNode = nodes.find(n => n.id === nextEndNodeId);
                                        if (endNode && reactFlowInstance) {
                                            reactFlowInstance.setCenter(endNode.position.x + 110, endNode.position.y + 60, { zoom: 1, duration: 500 });
                                        }
                                    }
                                }, className: "p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded transition-colors hover:bg-amber-500/30", title: `Go to End Node (${endNodeIds.size} total)` },
                                react_1.default.createElement(lucide_react_1.Flag, { size: 14 })))),
                    contextMenu && (react_1.default.createElement("div", { className: "fixed z-50", style: { left: contextMenu.x, top: contextMenu.y } },
                        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-lg p-1 min-w-[150px]" },
                            react_1.default.createElement("button", { onClick: () => {
                                    handleAddNode('npc', contextMenu.graphX, contextMenu.graphY);
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Add NPC Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleAddNode('player', contextMenu.graphX, contextMenu.graphY);
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Add Player Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleAddNode('conditional', contextMenu.graphX, contextMenu.graphY);
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Add Conditional Node"),
                            react_1.default.createElement("button", { onClick: () => setContextMenu(null), className: "w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded" }, "Cancel")))),
                    edgeDropMenu && (react_1.default.createElement("div", { className: "fixed z-50", style: { left: edgeDropMenu.x, top: edgeDropMenu.y } },
                        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-lg p-1 min-w-[150px]" },
                            react_1.default.createElement("div", { className: "px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#1a1a2e]" }, "Create Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleAddNode('npc', edgeDropMenu.graphX, edgeDropMenu.graphY, {
                                        fromNodeId: edgeDropMenu.fromNodeId,
                                        fromChoiceIdx: edgeDropMenu.fromChoiceIdx,
                                        fromBlockIdx: edgeDropMenu.fromBlockIdx,
                                        sourceHandle: edgeDropMenu.sourceHandle,
                                    });
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Add NPC Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleAddNode('player', edgeDropMenu.graphX, edgeDropMenu.graphY, {
                                        fromNodeId: edgeDropMenu.fromNodeId,
                                        fromChoiceIdx: edgeDropMenu.fromChoiceIdx,
                                        fromBlockIdx: edgeDropMenu.fromBlockIdx,
                                        sourceHandle: edgeDropMenu.sourceHandle,
                                    });
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Add Player Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleAddNode('conditional', edgeDropMenu.graphX, edgeDropMenu.graphY, {
                                        fromNodeId: edgeDropMenu.fromNodeId,
                                        fromChoiceIdx: edgeDropMenu.fromChoiceIdx,
                                        fromBlockIdx: edgeDropMenu.fromBlockIdx,
                                        sourceHandle: edgeDropMenu.sourceHandle,
                                    });
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Add Conditional Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    setEdgeDropMenu(null);
                                    connectingRef.current = null;
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded" }, "Cancel")))),
                    edgeContextMenu && (react_1.default.createElement("div", { className: "fixed z-50", style: { left: edgeContextMenu.x, top: edgeContextMenu.y } },
                        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-lg p-1 min-w-[180px]" },
                            react_1.default.createElement("div", { className: "px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#1a1a2e]" }, "Insert Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleInsertNode('npc', edgeContextMenu.edgeId, edgeContextMenu.graphX, edgeContextMenu.graphY);
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Insert NPC Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleInsertNode('player', edgeContextMenu.edgeId, edgeContextMenu.graphX, edgeContextMenu.graphY);
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Insert Player Node"),
                            react_1.default.createElement("button", { onClick: () => {
                                    handleInsertNode('conditional', edgeContextMenu.edgeId, edgeContextMenu.graphX, edgeContextMenu.graphY);
                                }, className: "w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded" }, "Insert Conditional Node"),
                            react_1.default.createElement("button", { onClick: () => setEdgeContextMenu(null), className: "w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded" }, "Cancel")))),
                    nodeContextMenu && (react_1.default.createElement("div", { className: "fixed z-50", style: { left: nodeContextMenu.x, top: nodeContextMenu.y } },
                        react_1.default.createElement("div", { className: "bg-[#1a1a2e] border border-purple-500 rounded-lg shadow-xl py-1 min-w-[180px]" },
                            (() => {
                                const node = dialogue.nodes[nodeContextMenu.nodeId];
                                if (!node)
                                    return null;
                                return (react_1.default.createElement(react_1.default.Fragment, null,
                                    react_1.default.createElement("div", { className: "px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#2a2a3e]" }, node.id),
                                    react_1.default.createElement("button", { onClick: () => {
                                            setSelectedNodeId(nodeContextMenu.nodeId);
                                            setNodeContextMenu(null);
                                        }, className: "w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2" },
                                        react_1.default.createElement(lucide_react_1.Edit3, { size: 14, className: "text-[#e94560]" }),
                                        " Edit Node"),
                                    node.type === 'player' && (react_1.default.createElement("button", { onClick: () => {
                                            handleAddChoice(nodeContextMenu.nodeId);
                                            setNodeContextMenu(null);
                                        }, className: "w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2" },
                                        react_1.default.createElement(lucide_react_1.Plus, { size: 14, className: "text-purple-400" }),
                                        " Add Choice")),
                                    node.type === 'npc' && !node.conditionalBlocks && (react_1.default.createElement("button", { onClick: () => {
                                            handleUpdateNode(nodeContextMenu.nodeId, {
                                                conditionalBlocks: [{
                                                        id: `block_${Date.now()}`,
                                                        type: 'if',
                                                        condition: [],
                                                        content: node.content,
                                                        speaker: node.speaker
                                                    }]
                                            });
                                            setSelectedNodeId(nodeContextMenu.nodeId);
                                            setNodeContextMenu(null);
                                        }, className: "w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2" },
                                        react_1.default.createElement(lucide_react_1.Plus, { size: 14, className: "text-blue-400" }),
                                        " Add Conditionals")),
                                    node.id !== dialogue.startNodeId && (react_1.default.createElement("button", { onClick: () => {
                                            handleDeleteNode(nodeContextMenu.nodeId);
                                            setNodeContextMenu(null);
                                        }, className: "w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-[#2a2a3e] flex items-center gap-2" },
                                        react_1.default.createElement(lucide_react_1.Trash2, { size: 14 }),
                                        " Delete"))));
                            })(),
                            react_1.default.createElement("button", { onClick: () => setNodeContextMenu(null), className: "w-full px-4 py-1.5 text-xs text-gray-500 hover:text-gray-300 border-t border-[#2a2a3e] mt-1" }, "Cancel")))))),
            selectedNode && (react_1.default.createElement(NodeEditor_1.NodeEditor, { node: selectedNode, dialogue: dialogue, onUpdate: (updates) => handleUpdateNode(selectedNode.id, updates), onFocusNode: (nodeId) => {
                    const targetNode = nodes.find(n => n.id === nodeId);
                    if (targetNode && reactFlowInstance) {
                        // Set selectedNodeId first so NodeEditor updates
                        setSelectedNodeId(nodeId);
                        // Update nodes using React Flow instance to ensure proper selection
                        const allNodes = reactFlowInstance.getNodes();
                        const updatedNodes = allNodes.map((n) => ({
                            ...n,
                            selected: n.id === nodeId
                        }));
                        reactFlowInstance.setNodes(updatedNodes);
                        // Also update local state to keep in sync
                        setNodes(updatedNodes);
                        // Focus on the target node with animation
                        setTimeout(() => {
                            reactFlowInstance.fitView({
                                nodes: [{ id: nodeId }],
                                padding: 0.2,
                                duration: 500,
                                minZoom: 0.5,
                                maxZoom: 2
                            });
                        }, 0);
                    }
                }, onDelete: () => handleDeleteNode(selectedNode.id), onAddChoice: () => handleAddChoice(selectedNode.id), onUpdateChoice: (idx, updates) => handleUpdateChoice(selectedNode.id, idx, updates), onRemoveChoice: (idx) => handleRemoveChoice(selectedNode.id, idx), onClose: () => setSelectedNodeId(null), flagSchema: flagSchema })))),
        viewMode === 'yarn' && (react_1.default.createElement(YarnView_1.YarnView, { dialogue: dialogue, onExport: () => {
                const yarn = (0, yarn_converter_1.exportToYarn)(dialogue);
                if (onExportYarn) {
                    onExportYarn(yarn);
                }
                else {
                    // Default: download file
                    const blob = new Blob([yarn], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${dialogue.title.replace(/\s+/g, '_')}.yarn`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }, onImport: (yarn) => {
                try {
                    const importedDialogue = (0, yarn_converter_1.importFromYarn)(yarn, dialogue.title);
                    onChange(importedDialogue);
                }
                catch (err) {
                    console.error('Failed to import Yarn:', err);
                    alert('Failed to import Yarn file. Please check the format.');
                }
            } })),
        viewMode === 'play' && (react_1.default.createElement(PlayView_1.PlayView, { dialogue: dialogue, flagSchema: flagSchema }))));
}
function DialogueEditorV2(props) {
    return (react_1.default.createElement(reactflow_1.ReactFlowProvider, null,
        react_1.default.createElement(DialogueEditorV2Internal, { ...props })));
}
