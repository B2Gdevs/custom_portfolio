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
import { Edit3, Plus, Trash2, Play } from 'lucide-react';
import 'reactflow/dist/style.css';

import { DialogueEditorProps, DialogueTree, DialogueNode, Choice } from '../types';
import { exportToYarn } from '../lib/yarn-converter';
import { convertDialogueTreeToReactFlow, updateDialogueTreeFromReactFlow } from '../utils/reactflow-converter';
import { createNode, deleteNodeFromTree, addChoiceToNode, removeChoiceFromNode, updateChoiceInNode } from '../utils/node-helpers';
import { NodeEditor } from './NodeEditor';
import { YarnView } from './YarnView';
import { PlayView } from './PlayView';
import { NPCNodeV2 } from './NPCNodeV2';
import { PlayerNodeV2 } from './PlayerNodeV2';
import { ChoiceEdgeV2 } from './ChoiceEdgeV2';
import { FlagSchema } from '../types/flags';
import { NODE_WIDTH } from '../utils/constants';

type ViewMode = 'graph' | 'yarn' | 'play';

// Define node and edge types
const nodeTypes = {
  npc: NPCNodeV2,
  player: PlayerNodeV2,
};

const edgeTypes = {
  choice: ChoiceEdgeV2,
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; graphX: number; graphY: number } | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [edgeDropMenu, setEdgeDropMenu] = useState<{ x: number; y: number; graphX: number; graphY: number; fromNodeId: string; fromChoiceIdx?: number } | null>(null);
  const reactFlowInstance = useReactFlow();
  const connectingRef = useRef<{ fromNodeId: string; fromChoiceIdx?: number } | null>(null);

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

  // Handle node changes (drag, delete, etc.)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    
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
      
      if (change.type === 'remove') {
        // Node was deleted
        const { [change.id]: _, ...rest } = dialogue.nodes;
        onChange({ ...dialogue, nodes: rest });
        if (selectedNodeId === change.id) {
          setSelectedNodeId(null);
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
        const edge = edges.find(e => e.id === change.id);
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
            }
          }
        }
      }
    });
  }, [dialogue, onChange, edges]);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const newEdge = addEdge(connection, edges);
    setEdges(newEdge);
    
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
    }
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

  // Add node from context menu
  const handleAddNode = useCallback((type: 'npc' | 'player', x: number, y: number) => {
    const newId = `${type}_${Date.now()}`;
    const newNode = createNode(type, newId, x, y);
    onChange({
      ...dialogue,
      nodes: { ...dialogue.nodes, [newId]: newNode }
    });
    setSelectedNodeId(newId);
    setContextMenu(null);
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

  return (
    <div className={`dialogue-editor-v2 ${className} w-full h-full flex flex-col`}>
      {viewMode === 'graph' && (
        <div className="flex-1 flex overflow-hidden">
          {/* React Flow Graph */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodesWithFlags}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneContextMenu={onPaneContextMenu}
              onNodeContextMenu={onNodeContextMenu}
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
              panOnDrag={[1, 2]} // Middle mouse button or space
              zoomOnScroll={true}
              zoomOnPinch={true}
              preventScrolling={false}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1a1a2e" />
              <Controls className="bg-[#0d0d14] border-[#1a1a2e]" />
              <MiniMap 
                className="bg-[#0d0d14] border-[#1a1a2e]"
                nodeColor={(node) => node.type === 'npc' ? '#e94560' : '#8b5cf6'}
              />
              
              {/* Pane Context Menu */}
              {contextMenu && (
                <Panel position="top-left" style={{ left: contextMenu.x, top: contextMenu.y }}>
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
                      onClick={() => setContextMenu(null)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-[#1a1a2e] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </Panel>
              )}

              {/* Node Context Menu */}
              {nodeContextMenu && (
                <Panel position="top-left" style={{ left: nodeContextMenu.x, top: nodeContextMenu.y }}>
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
                </Panel>
              )}
            </ReactFlow>
          </div>

          {/* Node Editor Sidebar */}
          {selectedNode && (
            <NodeEditor
              node={selectedNode}
              dialogue={dialogue}
              onUpdate={(updates) => handleUpdateNode(selectedNode.id, updates)}
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
