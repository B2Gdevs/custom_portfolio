/**
 * Dialogue Editor V2 - React Flow Implementation
 * 
 * This is the new version using React Flow for graph rendering.
 * See V2_MIGRATION_PLAN.md for implementation details.
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { 
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  Panel,
  ConnectionLineType,
  BackgroundVariant,
} from 'reactflow';
import { Edit3, Plus, Trash2, Play, Layout } from 'lucide-react';
import 'reactflow/dist/style.css';

import { DialogueEditorProps, DialogueTree, DialogueNode, Choice } from '../types';
import { exportToYarn } from '../lib/yarn-converter';
import { convertDialogueTreeToReactFlow, updateDialogueTreeFromReactFlow, CHOICE_COLORS } from '../utils/reactflow-converter';
import { createNode, deleteNodeFromTree, addChoiceToNode, removeChoiceFromNode, updateChoiceInNode } from '../utils/node-helpers';
import { applyHierarchicalLayout } from '../utils/layout';
import { NodeEditor } from './NodeEditor';
import { YarnView } from './YarnView';
import { PlayView } from './PlayView';
import { NPCNodeV2 } from './NPCNodeV2';
import { PlayerNodeV2 } from './PlayerNodeV2';
import { ConditionalNodeV2 } from './ConditionalNodeV2';
import { ChoiceEdgeV2 } from './ChoiceEdgeV2';
import { NPCEdgeV2 } from './NPCEdgeV2';
import { FlagSchema } from '../types/flags';
import { NODE_WIDTH } from '../utils/constants';

type ViewMode = 'graph' | 'yarn' | 'play';

// Define node and edge types outside component for stability
const nodeTypes = {
  npc: NPCNodeV2,
  player: PlayerNodeV2,
  conditional: ConditionalNodeV2,
};

const edgeTypes = {
  choice: ChoiceEdgeV2,
  default: NPCEdgeV2, // Use custom component for NPC edges instead of React Flow default
};

interface DialogueEditorV2InternalProps extends DialogueEditorProps {
  flagSchema?: FlagSchema;
  initialViewMode?: ViewMode;
}

function DialogueEditorV2Internal({
  dialogue,
  onChange,
  onExportYarn,
  onExportJSON,
  className = '',
  showTitleEditor = true,
  flagSchema,
  initialViewMode = 'graph',
}: DialogueEditorV2InternalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  
  // Memoize nodeTypes and edgeTypes to prevent React Flow warnings
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; graphX: number; graphY: number } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [edgeContextMenu, setEdgeContextMenu] = useState<{ x: number; y: number; edgeId: string; graphX: number; graphY: number } | null>(null);
  const [edgeDropMenu, setEdgeDropMenu] = useState<{ x: number; y: number; graphX: number; graphY: number; fromNodeId: string; fromChoiceIdx?: number; fromBlockIdx?: number; sourceHandle?: string } | null>(null);
  const reactFlowInstance = useReactFlow();
  const connectingRef = useRef<{ fromNodeId: string; fromChoiceIdx?: number; fromBlockIdx?: number; sourceHandle?: string } | null>(null);

  // Convert DialogueTree to React Flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => dialogue ? convertDialogueTreeToReactFlow(dialogue) : { nodes: [], edges: [] },
    [dialogue]
  );

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Update nodes/edges when dialogue changes externally
  React.useEffect(() => {
    if (dialogue) {
      const { nodes: newNodes, edges: newEdges } = convertDialogueTreeToReactFlow(dialogue);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [dialogue]);

  // Add flagSchema to node data
  const nodesWithFlags = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        flagSchema,
      },
    }));
  }, [nodes, flagSchema]);

  if (!dialogue) {
    return (
      <div className={`dialogue-editor-v2-empty ${className}`}>
        <p>No dialogue loaded. Please provide a dialogue tree.</p>
      </div>
    );
  }

  // Get selected node - use useMemo to ensure it updates when dialogue changes
  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !dialogue) return null;
    const node = dialogue.nodes[selectedNodeId];
    if (!node) return null;
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
  const onNodesDelete = useCallback((deleted: Node[]) => {
    let updatedNodes = { ...dialogue.nodes };
    let shouldClearSelection = false;
    
    deleted.forEach(node => {
      delete updatedNodes[node.id];
      if (selectedNodeId === node.id) {
        shouldClearSelection = true;
      }
    });
    
    onChange({ ...dialogue, nodes: updatedNodes });
    if (shouldClearSelection) {
      setSelectedNodeId(null);
    }
  }, [dialogue, onChange, selectedNodeId]);

  // Handle node changes (drag, delete, etc.)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    
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
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
    
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
            } else if (edge.sourceHandle?.startsWith('choice-')) {
              // Remove Player choice connection
              const choiceIdx = parseInt(edge.sourceHandle.replace('choice-', ''));
              if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
                const updated = updateChoiceInNode(sourceNode, choiceIdx, { nextNodeId: '' });
                onChange({
                  ...dialogue,
                  nodes: {
                    ...dialogue.nodes,
                    [edge.source]: updated,
                  },
                });
              }
            } else if (edge.sourceHandle?.startsWith('block-') && sourceNode.type === 'conditional') {
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
  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
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
        } else if (edge.sourceHandle?.startsWith('choice-')) {
          // Remove Player choice connection
          const choiceIdx = parseInt(edge.sourceHandle.replace('choice-', ''));
          if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
            const updated = updateChoiceInNode(sourceNode, choiceIdx, { nextNodeId: '' });
            onChange({
              ...dialogue,
              nodes: {
                ...dialogue.nodes,
                [edge.source]: updated,
              },
            });
          }
        } else if (edge.sourceHandle?.startsWith('block-') && sourceNode.type === 'conditional') {
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
  const onConnectStart = useCallback((_event: React.MouseEvent | React.TouchEvent, { nodeId, handleId }: { nodeId: string | null; handleId: string | null }) => {
    if (!nodeId) return;
    const sourceNode = dialogue.nodes[nodeId];
    if (!sourceNode) return;
    
    if (handleId === 'next' && sourceNode.type === 'npc') {
      connectingRef.current = { fromNodeId: nodeId, sourceHandle: 'next' };
    } else if (handleId?.startsWith('choice-')) {
      const choiceIdx = parseInt(handleId.replace('choice-', ''));
      connectingRef.current = { fromNodeId: nodeId, fromChoiceIdx: choiceIdx, sourceHandle: handleId };
    } else if (handleId?.startsWith('block-')) {
      const blockIdx = parseInt(handleId.replace('block-', ''));
      connectingRef.current = { fromNodeId: nodeId, fromBlockIdx: blockIdx, sourceHandle: handleId };
    }
  }, [dialogue]);

  // Handle connection end (check if dropped on empty space)
  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    if (!connectingRef.current) return;
    
    const targetIsNode = (event.target as HTMLElement).closest('.react-flow__node');
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
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const newEdge = addEdge(connection, edges);
    setEdges(newEdge);
    setEdgeDropMenu(null); // Close edge drop menu if open
    
    // Update DialogueTree
    const sourceNode = dialogue.nodes[connection.source];
    if (!sourceNode) return;
    
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
    } else if (connection.sourceHandle?.startsWith('choice-')) {
      // Player choice connection
      const choiceIdx = parseInt(connection.sourceHandle.replace('choice-', ''));
      if (sourceNode.choices && sourceNode.choices[choiceIdx]) {
        const updated = updateChoiceInNode(sourceNode, choiceIdx, { nextNodeId: connection.target });
        onChange({
          ...dialogue,
          nodes: {
            ...dialogue.nodes,
            [connection.source]: updated,
          },
        });
      }
    } else if (connection.sourceHandle?.startsWith('block-') && sourceNode.type === 'conditional') {
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
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setNodeContextMenu(null);
  }, []);

  // Handle pane context menu (right-click on empty space)
  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
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
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setNodeContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
    setContextMenu(null);
  }, []);

  // Handle edge context menu (right-click on edge to insert node)
  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    
    // Calculate midpoint position on the edge
    const sourceNodePosition = nodes.find(n => n.id === edge.source)?.position;
    const targetNodePosition = nodes.find(n => n.id === edge.target)?.position;
    
    if (!sourceNodePosition || !targetNodePosition) return;
    
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
  const handleInsertNode = useCallback((type: 'npc' | 'player' | 'conditional', edgeId: string, x: number, y: number) => {
    // Find the edge
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;
    
    // Get the source and target nodes
    const sourceNode = dialogue.nodes[edge.source];
    const targetNode = dialogue.nodes[edge.target];
    if (!sourceNode || !targetNode) return;
    
    // Create new node
    const newId = `${type}_${Date.now()}`;
    const newNode = createNode(type, newId, x, y);
    
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
    } else if (edge.sourceHandle?.startsWith('choice-')) {
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
    } else if (edge.sourceHandle?.startsWith('block-')) {
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
  const handleAddNode = useCallback((type: 'npc' | 'player' | 'conditional', x: number, y: number, autoConnect?: { fromNodeId: string; fromChoiceIdx?: number; fromBlockIdx?: number; sourceHandle?: string }) => {
    const newId = `${type}_${Date.now()}`;
    const newNode = createNode(type, newId, x, y);
    
    // First, create the new node
    onChange({
      ...dialogue,
      nodes: { ...dialogue.nodes, [newId]: newNode }
    });
    
    // Then, if auto-connecting, update the source node's connection
    // Do this in a separate call to ensure the new node exists first (like V1 did)
    if (autoConnect) {
      const sourceNode = dialogue.nodes[autoConnect.fromNodeId];
      if (sourceNode) {
        if (autoConnect.sourceHandle === 'next' && sourceNode.type === 'npc') {
          // Update NPC node's nextNodeId
          onChange({
            ...dialogue,
            nodes: {
              ...dialogue.nodes,
              [newId]: newNode, // Ensure new node is included
              [autoConnect.fromNodeId]: {
                ...sourceNode,
                nextNodeId: newId,
              },
            },
          });
        } else if (autoConnect.fromChoiceIdx !== undefined && sourceNode.choices) {
          // Update player choice's nextNodeId
          const newChoices = [...sourceNode.choices];
          newChoices[autoConnect.fromChoiceIdx] = {
            ...newChoices[autoConnect.fromChoiceIdx],
            nextNodeId: newId,
          };
          onChange({
            ...dialogue,
            nodes: {
              ...dialogue.nodes,
              [newId]: newNode, // Ensure new node is included
              [autoConnect.fromNodeId]: {
                ...sourceNode,
                choices: newChoices,
              },
            },
          });
        } else if (autoConnect.fromBlockIdx !== undefined && sourceNode.type === 'conditional' && sourceNode.conditionalBlocks) {
          // Update Conditional block's nextNodeId
          const newBlocks = [...sourceNode.conditionalBlocks];
          newBlocks[autoConnect.fromBlockIdx] = {
            ...newBlocks[autoConnect.fromBlockIdx],
            nextNodeId: newId,
          };
          onChange({
            ...dialogue,
            nodes: {
              ...dialogue.nodes,
              [newId]: newNode, // Ensure new node is included
              [autoConnect.fromNodeId]: {
                ...sourceNode,
                conditionalBlocks: newBlocks,
              },
            },
          });
        }
      }
    }
    
    setSelectedNodeId(newId);
    setContextMenu(null);
    setEdgeDropMenu(null);
    connectingRef.current = null;
  }, [dialogue, onChange]);

  // Handle node updates
  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<DialogueNode>) => {
    onChange({
      ...dialogue,
      nodes: {
        ...dialogue.nodes,
        [nodeId]: { ...dialogue.nodes[nodeId], ...updates }
      }
    });
  }, [dialogue, onChange]);

  // Handle choice updates
  const handleAddChoice = useCallback((nodeId: string) => {
    const updated = addChoiceToNode(dialogue.nodes[nodeId]);
    handleUpdateNode(nodeId, updated);
  }, [dialogue, handleUpdateNode]);

  const handleUpdateChoice = useCallback((nodeId: string, choiceIdx: number, updates: Partial<Choice>) => {
    const updated = updateChoiceInNode(dialogue.nodes[nodeId], choiceIdx, updates);
    handleUpdateNode(nodeId, updated);
  }, [dialogue, handleUpdateNode]);

  const handleRemoveChoice = useCallback((nodeId: string, choiceIdx: number) => {
    const updated = removeChoiceFromNode(dialogue.nodes[nodeId], choiceIdx);
    handleUpdateNode(nodeId, updated);
  }, [dialogue, handleUpdateNode]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    try {
      onChange(deleteNodeFromTree(dialogue, nodeId));
      setSelectedNodeId(null);
    } catch (e: any) {
      alert(e.message);
    }
  }, [dialogue, onChange]);

  // Handle auto-layout
  const handleAutoLayout = useCallback(() => {
    const layoutedDialogue = applyHierarchicalLayout(dialogue);
    onChange(layoutedDialogue);
    
    // Fit view after a short delay to allow React Flow to update
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
      }
    }, 100);
  }, [dialogue, onChange, reactFlowInstance]);

  return (
    <div className={`dialogue-editor-v2 ${className} w-full h-full flex flex-col`}>
      {viewMode === 'graph' && (
        <div className="flex-1 flex overflow-hidden">
          {/* React Flow Graph */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodesWithFlags}
              edges={edges}
              nodeTypes={memoizedNodeTypes}
              edgeTypes={memoizedEdgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onNodeClick={onNodeClick}
              onPaneContextMenu={onPaneContextMenu}
              onNodeContextMenu={onNodeContextMenu}
              onEdgeContextMenu={onEdgeContextMenu}
              onClick={() => {
                // Close context menus when clicking on pane
                setContextMenu(null);
                setNodeContextMenu(null);
              }}
              fitView
              className="bg-[#0a0a0f]"
              style={{ background: 'radial-gradient(circle, #1a1a2e 1px, #08080c 1px)', backgroundSize: '20px 20px' }}
              defaultEdgeOptions={{ type: 'default' }}
              connectionLineStyle={{ stroke: '#e94560', strokeWidth: 2 }}
              connectionLineType={ConnectionLineType.SmoothStep}
              snapToGrid={false}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              selectionOnDrag={true}
              panOnDrag={[1, 2]} // Middle mouse button or space
              zoomOnScroll={true}
              zoomOnPinch={true}
              preventScrolling={true}
              zoomOnDoubleClick={false}
              deleteKeyCode={['Delete', 'Backspace']}
              tabIndex={0}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
              <Controls className="bg-[#0d0d14] border-[#1a1a2e]" />
              <MiniMap 
                className="bg-[#0d0d14] border-[#1a1a2e]"
                nodeColor={(node) => node.type === 'npc' ? '#e94560' : '#8b5cf6'}
              />
              {/* Auto Layout Button */}
              <Panel position="top-right" className="!bg-transparent !border-0 !p-0">
                <button
                  onClick={handleAutoLayout}
                  className="bg-[#0d0d14] border border-[#1a1a2e] hover:border-[#3a3a4e] text-white px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors"
                  title="Auto Layout - Arrange nodes hierarchically"
                >
                  <Layout size={16} />
                  <span>Auto Layout</span>
                </button>
              </Panel>
              
              {/* Pane Context Menu */}
              {contextMenu && (
                <div 
                  className="fixed z-50"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                  <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-lg p-1 min-w-[150px]">
                    <button
                      onClick={() => {
                        handleAddNode('npc', contextMenu.graphX, contextMenu.graphY);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Add NPC Node
                    </button>
                    <button
                      onClick={() => {
                        handleAddNode('player', contextMenu.graphX, contextMenu.graphY);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Add Player Node
                    </button>
                    <button
                      onClick={() => {
                        handleAddNode('conditional', contextMenu.graphX, contextMenu.graphY);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Add Conditional Node
                    </button>
                    <button
                      onClick={() => setContextMenu(null)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Edge Drop Menu */}
              {edgeDropMenu && (
                <div 
                  className="fixed z-50"
                  style={{ left: edgeDropMenu.x, top: edgeDropMenu.y }}
                >
                  <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-lg p-1 min-w-[150px]">
                    <div className="px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#1a1a2e]">
                      Create Node
                    </div>
                    <button
                      onClick={() => {
                        handleAddNode('npc', edgeDropMenu.graphX, edgeDropMenu.graphY, {
                          fromNodeId: edgeDropMenu.fromNodeId,
                          fromChoiceIdx: edgeDropMenu.fromChoiceIdx,
                          fromBlockIdx: edgeDropMenu.fromBlockIdx,
                          sourceHandle: edgeDropMenu.sourceHandle,
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Add NPC Node
                    </button>
                    <button
                      onClick={() => {
                        handleAddNode('player', edgeDropMenu.graphX, edgeDropMenu.graphY, {
                          fromNodeId: edgeDropMenu.fromNodeId,
                          fromChoiceIdx: edgeDropMenu.fromChoiceIdx,
                          fromBlockIdx: edgeDropMenu.fromBlockIdx,
                          sourceHandle: edgeDropMenu.sourceHandle,
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Add Player Node
                    </button>
                    <button
                      onClick={() => {
                        handleAddNode('conditional', edgeDropMenu.graphX, edgeDropMenu.graphY, {
                          fromNodeId: edgeDropMenu.fromNodeId,
                          fromChoiceIdx: edgeDropMenu.fromChoiceIdx,
                          fromBlockIdx: edgeDropMenu.fromBlockIdx,
                          sourceHandle: edgeDropMenu.sourceHandle,
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Add Conditional Node
                    </button>
                    <button
                      onClick={() => {
                        setEdgeDropMenu(null);
                        connectingRef.current = null;
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Edge Context Menu */}
              {edgeContextMenu && (
                <div 
                  className="fixed z-50"
                  style={{ left: edgeContextMenu.x, top: edgeContextMenu.y }}
                >
                  <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-lg p-1 min-w-[180px]">
                    <div className="px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#1a1a2e]">
                      Insert Node
                    </div>
                    <button
                      onClick={() => {
                        handleInsertNode('npc', edgeContextMenu.edgeId, edgeContextMenu.graphX, edgeContextMenu.graphY);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Insert NPC Node
                    </button>
                    <button
                      onClick={() => {
                        handleInsertNode('player', edgeContextMenu.edgeId, edgeContextMenu.graphX, edgeContextMenu.graphY);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Insert Player Node
                    </button>
                    <button
                      onClick={() => {
                        handleInsertNode('conditional', edgeContextMenu.edgeId, edgeContextMenu.graphX, edgeContextMenu.graphY);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1a1a2e] rounded"
                    >
                      Insert Conditional Node
                    </button>
                    <button
                      onClick={() => setEdgeContextMenu(null)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Node Context Menu */}
              {nodeContextMenu && (
                <div 
                  className="fixed z-50"
                  style={{ left: nodeContextMenu.x, top: nodeContextMenu.y }}
                >
                  <div className="bg-[#1a1a2e] border border-purple-500 rounded-lg shadow-xl py-1 min-w-[180px]">
                    {(() => {
                      const node = dialogue.nodes[nodeContextMenu.nodeId];
                      if (!node) return null;
                      
                      return (
                        <>
                          <div className="px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#2a2a3e]">
                            {node.id}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedNodeId(nodeContextMenu.nodeId);
                              setNodeContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                          >
                            <Edit3 size={14} className="text-[#e94560]" /> Edit Node
                          </button>
                          {node.type === 'player' && (
                            <button
                              onClick={() => {
                                handleAddChoice(nodeContextMenu.nodeId);
                                setNodeContextMenu(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                            >
                              <Plus size={14} className="text-purple-400" /> Add Choice
                            </button>
                          )}
                          {node.type === 'npc' && !node.conditionalBlocks && (
                            <button
                              onClick={() => {
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
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                            >
                              <Plus size={14} className="text-blue-400" /> Add Conditionals
                            </button>
                          )}
                          {node.id !== dialogue.startNodeId && (
                            <button
                              onClick={() => {
                                handleDeleteNode(nodeContextMenu.nodeId);
                                setNodeContextMenu(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-[#2a2a3e] flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </>
                      );
                    })()}
                    <button
                      onClick={() => setNodeContextMenu(null)}
                      className="w-full px-4 py-1.5 text-xs text-gray-500 hover:text-gray-300 border-t border-[#2a2a3e] mt-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </ReactFlow>
          </div>

          {/* Node Editor Sidebar */}
          {selectedNode && (
            <NodeEditor
              node={selectedNode}
              dialogue={dialogue}
              onUpdate={(updates) => handleUpdateNode(selectedNode.id, updates)}
              onFocusNode={(nodeId) => {
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
              }}
              onDelete={() => handleDeleteNode(selectedNode.id)}
              onAddChoice={() => handleAddChoice(selectedNode.id)}
              onUpdateChoice={(idx, updates) => handleUpdateChoice(selectedNode.id, idx, updates)}
              onRemoveChoice={(idx) => handleRemoveChoice(selectedNode.id, idx)}
              onClose={() => setSelectedNodeId(null)}
              flagSchema={flagSchema}
            />
          )}
        </div>
      )}

      {viewMode === 'yarn' && (
        <YarnView
          dialogue={dialogue}
          onExport={() => {
            const yarn = exportToYarn(dialogue);
            if (onExportYarn) {
              onExportYarn(yarn);
            } else {
              // Default: download file
              const blob = new Blob([yarn], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${dialogue.title.replace(/\s+/g, '_')}.yarn`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
        />
      )}

      {viewMode === 'play' && (
        <PlayView
          dialogue={dialogue}
          flagSchema={flagSchema}
        />
      )}
    </div>
  );
}

export function DialogueEditorV2(props: DialogueEditorProps & { flagSchema?: FlagSchema; initialViewMode?: ViewMode }) {
  return (
    <ReactFlowProvider>
      <DialogueEditorV2Internal {...props} />
    </ReactFlowProvider>
  );
}
