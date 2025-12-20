'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RotateCcw, Save, Trash2, ChevronRight, X, Check, GitBranch, MessageSquare, Play, Download, Upload, FileText, Code, Edit3, Plus } from 'lucide-react';
import { YarnView } from '../../packages/dialogue-forge/src/components/YarnView';
import { PlayView } from '../../packages/dialogue-forge/src/components/PlayView';
import { NodeEditor } from '../../packages/dialogue-forge/src/components/NodeEditor';
import { GuidePanel } from '../../packages/dialogue-forge/src/components/GuidePanel';
import { FlagManager } from '../../packages/dialogue-forge/src/components/FlagManager';
import { ZoomControls } from '../../packages/dialogue-forge/src/components/ZoomControls';
import { ExampleLoader } from '../../packages/dialogue-forge/src/components/ExampleLoader';
import { exportToYarn, importFromYarn } from '../../packages/dialogue-forge/src/lib/yarn-converter';
import { FlagSchema, exampleFlagSchema } from '../../packages/dialogue-forge/src/types/flags';
import { DialogueTree, DialogueNode, Choice } from '../../packages/dialogue-forge/src/types';

interface HistoryEntry {
  nodeId: string;
  type: 'npc' | 'player';
  speaker?: string;
  content: string;
}

interface ContextMenu {
  x: number;
  y: number;
  graphX: number;
  graphY: number;
}

interface DraggingEdge {
  fromNodeId: string;
  fromChoiceIdx?: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const STORAGE_KEY = 'dialogue-forge-tree-v2';
const FLAG_SCHEMA_KEY = 'dialogue-forge-flag-schema';
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

const defaultDialogue: DialogueTree = {
  id: 'example-dialogue',
  title: 'Example: The Mysterious Stranger',
  startNodeId: 'start',
  nodes: {
    'start': {
      id: 'start', type: 'npc', speaker: 'Stranger', x: 300, y: 100,
      content: "You find yourself at a crossroads. A cloaked figure emerges from the shadows.",
      nextNodeId: 'greeting',
      setFlags: ['dialogue_met_stranger'] // Dialogue flag - temporary
    },
    'greeting': {
      id: 'greeting', type: 'npc', speaker: 'Stranger', x: 300, y: 200,
      content: "\"Traveler... I've been waiting for you. What brings you to these lands?\"",
      nextNodeId: 'first_choice'
    },
    'first_choice': {
      id: 'first_choice', type: 'player', content: '', x: 300, y: 300,
      choices: [
        {
          id: 'choice_treasure',
          text: "I seek the legendary treasure.",
          nextNodeId: 'treasure_response',
          setFlags: ['quest_dragon_slayer'] // Quest flag - persistent
        },
        {
          id: 'choice_knowledge',
          text: "I'm searching for ancient knowledge.",
          nextNodeId: 'knowledge_response',
          setFlags: ['dialogue_seeks_knowledge'] // Dialogue flag - temporary
        },
        {
          id: 'choice_hostile',
          text: "That's none of your business.",
          nextNodeId: 'hostile_response',
          setFlags: ['dialogue_hostile'] // Dialogue flag - temporary
        }
      ]
    },
    'treasure_response': {
      id: 'treasure_response', type: 'npc', speaker: 'Stranger', x: 100, y: 450,
      content: "\"Many have sought the same. Take this map—it shows the entrance to the catacombs.\"",
      setFlags: ['item_ancient_key'], // Item flag - persistent
      nextNodeId: 'second_choice'
    },
    'knowledge_response': {
      id: 'knowledge_response', type: 'npc', speaker: 'Stranger', x: 300, y: 450,
      content: "\"A seeker of truth... Take this tome. It contains the riddles you must solve.\"",
      setFlags: ['item_ancient_key'], // Item flag - persistent
      nextNodeId: 'second_choice'
    },
    'hostile_response': {
      id: 'hostile_response', type: 'npc', speaker: 'Stranger', x: 500, y: 450,
      content: "\"Very well. Walk your path alone.\"",
      nextNodeId: 'hostile_choice'
    },
    'hostile_choice': {
      id: 'hostile_choice', type: 'player', content: '', x: 500, y: 600,
      choices: [
        {
          id: 'apologize',
          text: "Wait—I apologize. These roads have made me wary.",
          nextNodeId: 'apology_response'
        },
        {
          id: 'leave',
          text: "I don't need your help. *walk away*",
          nextNodeId: 'leave_ending'
        }
      ]
    },
    'apology_response': {
      id: 'apology_response', type: 'npc', speaker: 'Stranger', x: 400, y: 750,
      content: "\"Humility... perhaps there is hope for you yet. Tell me, what do you truly seek?\"",
      nextNodeId: 'first_choice'
    },
    'leave_ending': {
      id: 'leave_ending', type: 'npc', speaker: 'Narrator', x: 600, y: 750,
      content: "You turn and walk away into the mist. Whatever secrets they held are lost to you now.\n\n— END —"
    },
    'second_choice': {
      id: 'second_choice', type: 'player', content: '', x: 200, y: 600,
      choices: [
        {
          id: 'ask_danger',
          text: "What dangers await me on this path?",
          nextNodeId: 'danger_info'
        },
        {
          id: 'ask_stranger',
          text: "Who are you? Why do you help travelers?",
          nextNodeId: 'stranger_reveal'
        },
        {
          id: 'thank_leave',
          text: "Thank you. I should be on my way.",
          nextNodeId: 'depart_response'
        }
      ]
    },
    'danger_info': {
      id: 'danger_info', type: 'npc', speaker: 'Stranger', x: 50, y: 800,
      content: "\"The forest is home to creatures that fear no blade. Beyond it, the ruins are patrolled by the Hollow.\"",
      nextNodeId: 'final_choice'
    },
    'stranger_reveal': {
      id: 'stranger_reveal', type: 'npc', speaker: 'Stranger', x: 200, y: 800,
      content: "The stranger pulls back their hood, revealing an ageless face marked with glowing runes. \"I am the last of the Keepers.\"",
      setFlags: ['achievement_first_quest', 'stat_reputation'], // Achievement + stat flags
      nextNodeId: 'final_choice'
    },
    'depart_response': {
      id: 'depart_response', type: 'npc', speaker: 'Stranger', x: 300, y: 800,
      content: "\"May the old gods watch over you, traveler.\"\n\n— TO BE CONTINUED —"
    },
    'final_choice': {
      id: 'final_choice', type: 'player', content: '', x: 125, y: 950,
      choices: [
        {
          id: 'ready',
          text: "I'm ready. Point me to the path.",
          nextNodeId: 'depart_response'
        },
        {
          id: 'more_questions',
          text: "I have more questions...",
          nextNodeId: 'second_choice'
        }
      ]
    }
  }
};

// importFromYarn is now imported from the package

export default function DialogueForgePage() {
  const [dialogueTree, setDialogueTree] = useState<DialogueTree>(defaultDialogue);
  const [flagSchema, setFlagSchema] = useState<FlagSchema>(exampleFlagSchema);
  const [showFlagManager, setShowFlagManager] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string>(defaultDialogue.startNodeId);
  const [viewMode, setViewMode] = useState<'graph' | 'play' | 'yarn'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [graphOffset, setGraphOffset] = useState({ x: 150, y: 30 });
  const [graphScale, setGraphScale] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<DraggingEdge | null>(null);
  const [edgeDropMenu, setEdgeDropMenu] = useState<{ x: number; y: number; graphX: number; graphY: number; fromNodeId: string; fromChoiceIdx?: number } | null>(null);
  const skipNextClick = useRef(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const graphRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flagFileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDialogueTree(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load:', e);
      }
    }
    
    const storedFlags = localStorage.getItem(FLAG_SCHEMA_KEY);
    if (storedFlags) {
      try {
        setFlagSchema(JSON.parse(storedFlags));
      } catch (e) {
        console.error('Failed to load flags:', e);
      }
    }
  }, []);

  // PlayView now handles its own state

  useEffect(() => {
    console.log('edgeDropMenu state changed:', edgeDropMenu);
  }, [edgeDropMenu]);

  // Mouse handlers for graph
  const handleGraphMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; // Right click handled separately
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    if ((e.target as HTMLElement).closest('.context-menu')) return;
    // Don't start panning if we're dragging an edge
    if (draggingEdge) return;
    setContextMenu(null);
    // Only clear edge drop menu on explicit clicks, not on mousedown during edge drag release
    if (!edgeDropMenu) {
      setIsPanning(true);
      panStart.current = { x: e.clientX - graphOffset.x, y: e.clientY - graphOffset.y };
    }
  };

  const handleGraphClick = (e: React.MouseEvent) => {
    // Skip this click if it came from edge drop
    if (skipNextClick.current) {
      skipNextClick.current = false;
      return;
    }
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    if ((e.target as HTMLElement).closest('.context-menu')) return;
    // Clear menus on click
    setEdgeDropMenu(null);
    setContextMenu(null);
    setNodeContextMenu(null);
    setSelectedNodeId(null);
  };

  const handleGraphContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = graphRef.current?.getBoundingClientRect();
    if (!rect) return;
    const graphX = (e.clientX - rect.left - graphOffset.x) / graphScale;
    const graphY = (e.clientY - rect.top - graphOffset.y) / graphScale;
    setContextMenu({ x: e.clientX, y: e.clientY, graphX, graphY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setGraphOffset({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
      }
      if (draggingNodeId) {
        const dx = (e.clientX - dragStart.current.x) / graphScale;
        const dy = (e.clientY - dragStart.current.y) / graphScale;
        setDialogueTree(prev => ({
          ...prev,
          nodes: {
            ...prev.nodes,
            [draggingNodeId]: {
              ...prev.nodes[draggingNodeId],
              x: dragStart.current.nodeX + dx,
              y: dragStart.current.nodeY + dy
            }
          }
        }));
        setHasChanges(true);
      }
      if (draggingEdge) {
        const rect = graphRef.current?.getBoundingClientRect();
        if (rect) {
          setDraggingEdge(prev => prev ? {
            ...prev,
            endX: (e.clientX - rect.left - graphOffset.x) / graphScale,
            endY: (e.clientY - rect.top - graphOffset.y) / graphScale
          } : null);
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      console.log('mouseup', { draggingEdge, isPanning, draggingNodeId });
      
      // Handle edge drop first, before clearing other states
      if (draggingEdge) {
        console.log('has draggingEdge', draggingEdge);
        const rect = graphRef.current?.getBoundingClientRect();
        if (rect) {
          const dropX = (e.clientX - rect.left - graphOffset.x) / graphScale;
          const dropY = (e.clientY - rect.top - graphOffset.y) / graphScale;
          console.log('drop position', { dropX, dropY, clientX: e.clientX, clientY: e.clientY });
          
          // Find node at drop position
          const targetNode = Object.values(dialogueTree.nodes).find(n => 
            dropX >= n.x && dropX <= n.x + NODE_WIDTH &&
            dropY >= n.y && dropY <= n.y + NODE_HEIGHT
          );
          
          console.log('targetNode', targetNode);
          
          if (targetNode && targetNode.id !== draggingEdge.fromNodeId) {
            console.log('connecting to existing node');
            // Connect to existing node
            if (draggingEdge.fromChoiceIdx !== undefined) {
              const fromNode = dialogueTree.nodes[draggingEdge.fromNodeId];
              if (fromNode.choices) {
                const newChoices = [...fromNode.choices];
                newChoices[draggingEdge.fromChoiceIdx] = {
                  ...newChoices[draggingEdge.fromChoiceIdx],
                  nextNodeId: targetNode.id
                };
                setDialogueTree(prev => ({
                  ...prev,
                  nodes: {
                    ...prev.nodes,
                    [draggingEdge.fromNodeId]: { ...fromNode, choices: newChoices }
                  }
                }));
              }
            } else {
              setDialogueTree(prev => ({
                ...prev,
                nodes: {
                  ...prev.nodes,
                  [draggingEdge.fromNodeId]: {
                    ...prev.nodes[draggingEdge.fromNodeId],
                    nextNodeId: targetNode.id
                  }
                }
              }));
            }
            setHasChanges(true);
            setDraggingEdge(null);
          } else {
            // Dropped on empty space - show menu to create new node
            console.log('showing edge drop menu at', e.clientX, e.clientY);
            skipNextClick.current = true;
            setEdgeDropMenu({
              x: e.clientX,
              y: e.clientY,
              graphX: dropX,
              graphY: dropY,
              fromNodeId: draggingEdge.fromNodeId,
              fromChoiceIdx: draggingEdge.fromChoiceIdx
            });
            setDraggingEdge(null);
          }
        } else {
          console.log('no rect');
          setDraggingEdge(null);
        }
        return; // Don't process further after handling edge
      }
      
      setIsPanning(false);
      setDraggingNodeId(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && viewMode === 'graph') {
        // Don't delete if we're typing in an input
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (selectedNodeId !== dialogueTree.startNodeId) {
          deleteNode(selectedNodeId);
        }
      }
      if (e.key === 'Escape') {
        setContextMenu(null);
        setEdgeDropMenu(null);
        setSelectedNodeId(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanning, draggingNodeId, draggingEdge, graphOffset, graphScale, dialogueTree.nodes, selectedNodeId, viewMode, dialogueTree.startNodeId]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setGraphScale(s => Math.min(2, Math.max(0.3, s * (e.deltaY > 0 ? 0.9 : 1.1))));
  };
  
  const handleZoomIn = () => {
    setGraphScale(s => Math.min(2, s * 1.2));
  };
  
  const handleZoomOut = () => {
    setGraphScale(s => Math.max(0.3, s * 0.8));
  };
  
  const handleZoomFit = () => {
    const nodes = Object.values(dialogueTree.nodes);
    if (nodes.length === 0) {
      setGraphOffset({ x: 150, y: 30 });
      setGraphScale(0.85);
      return;
    }
    
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs.map(x => x + NODE_WIDTH));
    const maxY = Math.max(...ys.map(y => y + NODE_HEIGHT));
    
    const width = maxX - minX;
    const height = maxY - minY;
    const graphRect = graphRef.current?.getBoundingClientRect();
    if (!graphRect) return;
    
    const scaleX = (graphRect.width - 100) / width;
    const scaleY = (graphRect.height - 100) / height;
    const scale = Math.min(scaleX, scaleY, 1.5) * 0.9;
    
    setGraphScale(scale);
    setGraphOffset({
      x: -minX * scale + 50,
      y: -minY * scale + 50
    });
  };
  
  const selectedNode = selectedNodeId ? dialogueTree.nodes[selectedNodeId] : null;

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dialogueTree));
    localStorage.setItem(FLAG_SCHEMA_KEY, JSON.stringify(flagSchema));
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateNode = useCallback((nodeId: string, updates: Partial<DialogueNode>) => {
    setDialogueTree(prev => ({
      ...prev,
      nodes: { ...prev.nodes, [nodeId]: { ...prev.nodes[nodeId], ...updates } }
    }));
    setHasChanges(true);
  }, []);

  const addNode = (type: 'npc' | 'player', x: number, y: number) => {
    const newId = `${type}_${Date.now()}`;
    const newNode: DialogueNode = {
      id: newId,
      type,
      content: type === 'npc' ? 'New dialogue...' : '',
      speaker: type === 'npc' ? 'Character' : undefined,
      choices: type === 'player' ? [{ id: `c_${Date.now()}`, text: 'Choice 1', nextNodeId: '' }] : undefined,
      x, y
    };
    setDialogueTree(prev => ({ ...prev, nodes: { ...prev.nodes, [newId]: newNode } }));
    setHasChanges(true);
    setSelectedNodeId(newId);
    setContextMenu(null);
    return newId;
  };

  const addNodeAndConnect = (type: 'npc' | 'player', x: number, y: number, fromNodeId: string, fromChoiceIdx?: number) => {
    const newId = addNode(type, x, y);
    
    // Connect the new node
    if (fromChoiceIdx !== undefined) {
      const fromNode = dialogueTree.nodes[fromNodeId];
      if (fromNode?.choices) {
        const newChoices = [...fromNode.choices];
        newChoices[fromChoiceIdx] = { ...newChoices[fromChoiceIdx], nextNodeId: newId };
        setDialogueTree(prev => ({
          ...prev,
          nodes: {
            ...prev.nodes,
            [newId]: { ...prev.nodes[newId] }, // ensure new node exists
            [fromNodeId]: { ...prev.nodes[fromNodeId], choices: newChoices }
          }
        }));
      }
    } else {
      setDialogueTree(prev => ({
        ...prev,
        nodes: {
          ...prev.nodes,
          [fromNodeId]: { ...prev.nodes[fromNodeId], nextNodeId: newId }
        }
      }));
    }
    setEdgeDropMenu(null);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === dialogueTree.startNodeId) {
      alert("Can't delete the start node!");
      return;
    }
    setDialogueTree(prev => {
      const { [nodeId]: _, ...rest } = prev.nodes;
      // Also remove references to this node
      Object.keys(rest).forEach(id => {
        if (rest[id].nextNodeId === nodeId) {
          rest[id] = { ...rest[id], nextNodeId: undefined };
        }
        if (rest[id].choices) {
          rest[id] = {
            ...rest[id],
            choices: rest[id].choices!.map(c => c.nextNodeId === nodeId ? { ...c, nextNodeId: '' } : c)
          };
        }
      });
      return { ...prev, nodes: rest };
    });
    setSelectedNodeId(null);
    setHasChanges(true);
  };

  const addChoice = (nodeId: string) => {
    const node = dialogueTree.nodes[nodeId];
    updateNode(nodeId, {
      choices: [...(node.choices || []), { id: `c_${Date.now()}`, text: 'New choice...', nextNodeId: '' }]
    });
  };

  const updateChoice = (nodeId: string, idx: number, updates: Partial<Choice>) => {
    const node = dialogueTree.nodes[nodeId];
    if (!node.choices) return;
    const newChoices = [...node.choices];
    newChoices[idx] = { ...newChoices[idx], ...updates };
    updateNode(nodeId, { choices: newChoices });
  };

  const deleteChoice = (nodeId: string, idx: number) => {
    const node = dialogueTree.nodes[nodeId];
    if (!node.choices || node.choices.length <= 1) return;
    updateNode(nodeId, { choices: node.choices.filter((_, i) => i !== idx) });
  };

  const handleExportYarn = () => {
    const yarn = exportToYarn(dialogueTree);
    const blob = new Blob([yarn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dialogueTree.title.replace(/\s+/g, '_')}.yarn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(dialogueTree, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dialogueTree.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportFlags = () => {
    const json = JSON.stringify(flagSchema, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flag-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImportFlags = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        const imported = JSON.parse(content) as FlagSchema;
        setFlagSchema(imported);
        setHasChanges(true);
      } catch (err) {
        alert('Failed to import flag schema');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        if (file.name.endsWith('.yarn')) {
          const dialogue = importFromYarn(content);
          setDialogueTree(dialogue);
        } else {
          setDialogueTree(JSON.parse(content));
        }
        setHasChanges(true);
      } catch (err) {
        console.error('Import error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        alert(`Failed to import file: ${errorMessage}`);
      }
    };
    reader.onerror = () => {
      alert('Failed to read file');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startEdgeDrag = (nodeId: string, choiceIdx?: number) => {
    console.log('startEdgeDrag', nodeId, choiceIdx);
    const node = dialogueTree.nodes[nodeId];
    const startX = node.x + NODE_WIDTH / 2;
    const startY = node.y + NODE_HEIGHT + (choiceIdx !== undefined ? 20 + choiceIdx * 24 : 0);
    setDraggingEdge({ fromNodeId: nodeId, fromChoiceIdx: choiceIdx, startX, startY, endX: startX, endY: startY + 50 });
  };

  const startNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = dialogueTree.nodes[nodeId];
    setDraggingNodeId(nodeId);
    dragStart.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };
  };

  // Render connections
  const renderConnections = () => {
    const lines: React.ReactElement[] = [];
    
    Object.values(dialogueTree.nodes).forEach(node => {
      const fromX = node.x + NODE_WIDTH / 2;
      const fromY = node.y + NODE_HEIGHT;
      
      if (node.type === 'npc' && node.nextNodeId && dialogueTree.nodes[node.nextNodeId]) {
        const target = dialogueTree.nodes[node.nextNodeId];
        const toX = target.x + NODE_WIDTH / 2;
        const toY = target.y;
        const midY = (fromY + toY) / 2;
        
        lines.push(
          <path
            key={`${node.id}-next`}
            d={`M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
            fill="none"
            stroke="#4a4a6a"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        );
      }
      
      if (node.choices) {
        const colors = ['#e94560', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];
        node.choices.forEach((choice, idx) => {
          if (choice.nextNodeId && dialogueTree.nodes[choice.nextNodeId]) {
            const target = dialogueTree.nodes[choice.nextNodeId];
            const cFromY = fromY + 10 + idx * 24;
            const toX = target.x + NODE_WIDTH / 2;
            const toY = target.y;
            const midY = (cFromY + toY) / 2;
            const color = colors[idx % colors.length];
            
            lines.push(
              <path
                key={`${node.id}-choice-${idx}`}
                d={`M ${fromX} ${cFromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.7"
                markerEnd={`url(#arrow-${idx})`}
              />
            );
          }
        });
      }
    });
    
    // Dragging edge preview
    if (draggingEdge) {
      const midY = (draggingEdge.startY + draggingEdge.endY) / 2;
      lines.push(
        <path
          key="dragging"
          d={`M ${draggingEdge.startX} ${draggingEdge.startY} C ${draggingEdge.startX} ${midY}, ${draggingEdge.endX} ${midY}, ${draggingEdge.endX} ${draggingEdge.endY}`}
          fill="none"
          stroke="#e94560"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      );
    }
    
    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ overflow: 'visible' }}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#4a4a6a" />
          </marker>
          {['#e94560', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'].map((color, i) => (
            <marker key={i} id={`arrow-${i}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
        </defs>
        {lines}
      </svg>
    );
  };

  return (
    <div className="w-full h-full bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] bg-[#0d0d14]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/projects/dialogue-forge-interactive-narrative-builder" className="text-gray-400 hover:text-white">
              <ArrowLeft size={18} />
            </Link>
            <input
              type="text"
              value={dialogueTree.title}
              onChange={(e) => { setDialogueTree(prev => ({ ...prev, title: e.target.value })); setHasChanges(true); }}
              className="bg-transparent text-white font-semibold text-lg outline-none border-b border-transparent hover:border-[#2a2a3e] focus:border-[#e94560]"
            />
            {hasChanges && <span className="text-xs text-yellow-500">•</span>}
          </div>
          
          <div className="flex items-center gap-1 bg-[#1a1a2e] rounded-lg p-0.5">
            <button onClick={() => setViewMode('graph')} className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${viewMode === 'graph' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`} title="Graph Editor">
              <GitBranch size={14} />
            </button>
            <button onClick={() => setViewMode('yarn')} className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${viewMode === 'yarn' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`} title="Yarn Script">
              <Code size={14} />
            </button>
            <button onClick={() => setViewMode('play')} className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${viewMode === 'play' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`} title="Play Test">
              <Play size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Examples & Flags */}
            <ExampleLoader
              onLoadDialogue={(dialogue) => {
                setDialogueTree(dialogue);
                setHasChanges(true);
              }}
              onLoadFlags={(flags) => {
                setFlagSchema(flags);
                setHasChanges(true);
              }}
            />
            <button onClick={() => setShowFlagManager(true)} className="p-2 text-gray-400 hover:text-white" title="Manage Flags">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6M9 15h6M9 12h6" />
              </svg>
            </button>
            
            <div className="h-6 w-px bg-[#2a2a3e] mx-1" />
            
            {/* Import/Export */}
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" title="Import Dialogue (.yarn or .json)">
              <Upload size={16} />
            </button>
            <input ref={fileInputRef} type="file" accept=".json,.yarn" onChange={handleImport} className="hidden" />
            <button onClick={handleExportYarn} className="p-2 text-gray-400 hover:text-white" title="Export to Yarn (.yarn)">
              <FileText size={16} />
            </button>
            
            <div className="h-6 w-px bg-[#2a2a3e] mx-1" />
            
            {/* Guide & Save */}
            <button onClick={() => setShowGuide(true)} className="p-2 text-gray-400 hover:text-white" title="Guide & Documentation">
              <BookOpen size={16} />
            </button>
            <button onClick={handleSave} className={`p-2 rounded ${saved ? 'text-green-400' : hasChanges ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`} title="Save">
              {saved ? <Check size={16} /> : <Save size={16} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Graph View */}
        {viewMode === 'graph' && (
          <>
            <div
              ref={graphRef}
              className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
              style={{ background: 'radial-gradient(circle, #1a1a2e 1px, #08080c 1px)', backgroundSize: '20px 20px' }}
              onMouseDown={handleGraphMouseDown}
              onContextMenu={handleGraphContextMenu}
              onWheel={handleWheel}
              onClick={handleGraphClick}
            >
              <div style={{ transform: `translate(${graphOffset.x}px, ${graphOffset.y}px) scale(${graphScale})`, transformOrigin: '0 0' }} className="relative">
                {renderConnections()}
                
                {Object.values(dialogueTree.nodes).map(node => (
                  <div
                    key={node.id}
                    className={`graph-node absolute select-none cursor-move`}
                    style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
                    onMouseDown={(e) => { e.stopPropagation(); startNodeDrag(node.id, e); }}
                    onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); setContextMenu(null); setNodeContextMenu(null); }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setNodeContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
                      setContextMenu(null);
                    }}
                  >
                    <div className={`rounded-lg border-2 transition-all ${
                      selectedNodeId === node.id ? 'border-[#e94560] shadow-lg shadow-[#e94560]/20' :
                      currentNodeId === node.id ? 'border-green-500' : 'border-[#2a2a3e]'
                    } ${node.type === 'npc' ? 'bg-[#1a1a2e]' : 'bg-[#1e1e3a]'}`}>
                      {/* Header */}
                      <div className={`px-3 py-1.5 border-b border-[#2a2a3e] flex items-center gap-2 rounded-t-lg ${
                        node.type === 'npc' ? 'bg-[#12121a]' : 'bg-[#16162a]'
                      }`}>
                        {node.type === 'npc' ? <MessageSquare size={12} className="text-[#e94560]" /> : <GitBranch size={12} className="text-purple-400" />}
                        <span className="text-[10px] font-mono text-gray-500 truncate flex-1">{node.id}</span>
                        <span className="text-[10px] text-gray-600">{node.type === 'npc' ? 'NPC' : 'PLAYER'}</span>
                      </div>
                      {/* Content */}
                      <div className="px-3 py-2 min-h-[50px]">
                        {node.type === 'npc' && node.speaker && (
                          <div className="text-[10px] text-[#e94560] font-medium">{node.speaker}</div>
                        )}
                        <div className="text-xs text-gray-400 line-clamp-2">
                          {node.type === 'npc' ? node.content.slice(0, 60) + (node.content.length > 60 ? '...' : '') : `${node.choices?.length || 0} choices`}
                        </div>
                        {/* Flag indicators */}
                        {node.setFlags && node.setFlags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {node.setFlags.map(flagId => {
                              const flag = flagSchema.flags.find(f => f.id === flagId);
                              if (!flag) return null;
                              const colorClass = flag.type === 'quest' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                flag.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                flag.type === 'item' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                flag.type === 'stat' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                flag.type === 'title' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                                flag.type === 'global' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/30';
                              return (
                                <span key={flagId} className={`text-[8px] px-1 py-0.5 rounded border ${colorClass}`} title={flag.name}>
                                  {flag.type === 'dialogue' ? 'temp' : flag.type[0]}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {/* Output port */}
                      {node.type === 'npc' && (
                        <div
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#2a2a3e] border-2 border-[#4a4a6a] rounded-full cursor-crosshair hover:border-[#e94560] hover:bg-[#e94560]/20"
                          onMouseDown={(e) => { e.stopPropagation(); startEdgeDrag(node.id); }}
                        />
                      )}
                      {/* Choice outputs */}
                      {node.type === 'player' && node.choices && (
                        <div className="border-t border-[#2a2a3e]">
                          {node.choices.map((choice, idx) => (
                            <div key={choice.id} className="px-3 py-1 text-[10px] text-gray-400 flex items-center gap-2 border-b border-[#2a2a3e] last:border-0 relative">
                              <div className="flex-1 min-w-0">
                                <span className="truncate block">{choice.text.slice(0, 25)}...</span>
                                {/* Choice flag indicators */}
                                {choice.setFlags && choice.setFlags.length > 0 && (
                                  <div className="mt-0.5 flex flex-wrap gap-0.5">
                                    {choice.setFlags.map(flagId => {
                                      const flag = flagSchema.flags.find(f => f.id === flagId);
                                      if (!flag) return null;
                                      const colorClass = flag.type === 'quest' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                        flag.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                        flag.type === 'item' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        flag.type === 'stat' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                        flag.type === 'title' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                                        flag.type === 'global' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                        'bg-gray-500/20 text-gray-400 border-gray-500/30';
                                      return (
                                        <span key={flagId} className={`text-[7px] px-0.5 py-0 rounded border ${colorClass}`} title={flag.name}>
                                          {flag.type === 'dialogue' ? 't' : flag.type[0]}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <div
                                className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#2a2a3e] border-2 border-purple-400 rounded-full cursor-crosshair hover:border-[#e94560] hover:bg-[#e94560]/20"
                                onMouseDown={(e) => { e.stopPropagation(); startEdgeDrag(node.id, idx); }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Input port */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#2a2a3e] border-2 border-[#4a4a6a] rounded-full" />
                  </div>
                ))}
              </div>

              {/* Help text */}
              <div className="absolute bottom-3 left-3 text-[10px] text-gray-600">
                Right-click to add nodes • Drag ports to connect • Scroll to zoom
              </div>
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4">
                <ZoomControls
                  scale={graphScale}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onZoomFit={handleZoomFit}
                />
              </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
              <div
                className="context-menu fixed bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-xl py-1 z-50"
                style={{ left: contextMenu.x, top: contextMenu.y }}
              >
                <button
                  onClick={() => addNode('npc', contextMenu.graphX, contextMenu.graphY)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                >
                  <MessageSquare size={14} className="text-[#e94560]" /> Add NPC Node
                </button>
                <button
                  onClick={() => addNode('player', contextMenu.graphX, contextMenu.graphY)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                >
                  <GitBranch size={14} className="text-purple-400" /> Add Player Node
                </button>
              </div>
            )}

            {/* Edge Drop Menu - appears when dragging edge to empty space */}
            {edgeDropMenu && (
              <div
                className="context-menu fixed bg-[#1a1a2e] border-2 border-[#e94560] rounded-lg shadow-xl py-1"
                style={{ left: edgeDropMenu.x, top: edgeDropMenu.y, zIndex: 9999 }}
              >
                <div className="px-3 py-1 text-[10px] text-gray-500 uppercase border-b border-[#2a2a3e]">Create & Connect</div>
                <button
                  onClick={() => addNodeAndConnect('npc', edgeDropMenu.graphX, edgeDropMenu.graphY, edgeDropMenu.fromNodeId, edgeDropMenu.fromChoiceIdx)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                >
                  <MessageSquare size={14} className="text-[#e94560]" /> NPC Node
                </button>
                <button
                  onClick={() => addNodeAndConnect('player', edgeDropMenu.graphX, edgeDropMenu.graphY, edgeDropMenu.fromNodeId, edgeDropMenu.fromChoiceIdx)}
                  className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                >
                  <GitBranch size={14} className="text-purple-400" /> Player Node
                </button>
                {Object.keys(dialogueTree.nodes).length > 1 && (
                  <>
                    <div className="px-3 py-1 text-[10px] text-gray-500 uppercase border-t border-b border-[#2a2a3e] mt-1">Connect to Existing</div>
                    <div className="max-h-32 overflow-y-auto">
                      {Object.values(dialogueTree.nodes)
                        .filter(n => n.id !== edgeDropMenu.fromNodeId)
                        .map(node => (
                          <button
                            key={node.id}
                            onClick={() => {
                              if (edgeDropMenu.fromChoiceIdx !== undefined) {
                                const fromNode = dialogueTree.nodes[edgeDropMenu.fromNodeId];
                                if (fromNode?.choices) {
                                  const newChoices = [...fromNode.choices];
                                  newChoices[edgeDropMenu.fromChoiceIdx] = { ...newChoices[edgeDropMenu.fromChoiceIdx], nextNodeId: node.id };
                                  setDialogueTree(prev => ({
                                    ...prev,
                                    nodes: { ...prev.nodes, [edgeDropMenu.fromNodeId]: { ...fromNode, choices: newChoices } }
                                  }));
                                }
                              } else {
                                setDialogueTree(prev => ({
                                  ...prev,
                                  nodes: { ...prev.nodes, [edgeDropMenu.fromNodeId]: { ...prev.nodes[edgeDropMenu.fromNodeId], nextNodeId: node.id } }
                                }));
                              }
                              setHasChanges(true);
                              setEdgeDropMenu(null);
                            }}
                            className="w-full px-4 py-1.5 text-xs text-left text-gray-400 hover:bg-[#2a2a3e] hover:text-white flex items-center gap-2"
                          >
                            {node.type === 'npc' ? <MessageSquare size={12} className="text-[#e94560]" /> : <GitBranch size={12} className="text-purple-400" />}
                            <span className="font-mono truncate">{node.id}</span>
                          </button>
                        ))}
                    </div>
                  </>
                )}
                <button
                  onClick={() => setEdgeDropMenu(null)}
                  className="w-full px-4 py-1.5 text-xs text-gray-500 hover:text-gray-300 border-t border-[#2a2a3e] mt-1"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Node Context Menu */}
            {nodeContextMenu && (
              <div
                className="context-menu fixed bg-[#1a1a2e] border border-purple-500 rounded-lg shadow-xl py-1"
                style={{ left: nodeContextMenu.x, top: nodeContextMenu.y, zIndex: 9999 }}
              >
                {(() => {
                  const node = dialogueTree.nodes[nodeContextMenu.nodeId];
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
                            addChoice(nodeContextMenu.nodeId);
                            setNodeContextMenu(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                        >
                          <Plus size={14} className="text-purple-400" /> Add Choice
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const newNode = { ...node, id: `${node.id}_copy_${Date.now()}`, x: node.x + 50, y: node.y + 50 };
                          setDialogueTree(prev => ({
                            ...prev,
                            nodes: { ...prev.nodes, [newNode.id]: newNode }
                          }));
                          setHasChanges(true);
                          setNodeContextMenu(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Duplicate
                      </button>
                      {nodeContextMenu.nodeId !== dialogueTree.startNodeId && (
                        <button
                          onClick={() => {
                            deleteNode(nodeContextMenu.nodeId);
                            setNodeContextMenu(null);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-[#2a2a3e] flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCurrentNodeId(nodeContextMenu.nodeId);
                          setViewMode('play');
                          setNodeContextMenu(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-[#2a2a3e] flex items-center gap-2 border-t border-[#2a2a3e] mt-1"
                      >
                        <Play size={14} className="text-green-400" /> Play from Here
                      </button>
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
            )}

            {/* Node Editor Panel */}
            {selectedNode && (
              <NodeEditor
                node={selectedNode}
                dialogue={dialogueTree}
                onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                onDelete={() => deleteNode(selectedNode.id)}
                onAddChoice={() => addChoice(selectedNode.id)}
                onUpdateChoice={(idx, updates) => updateChoice(selectedNode.id, idx, updates)}
                onRemoveChoice={(idx) => deleteChoice(selectedNode.id, idx)}
                onClose={() => setSelectedNodeId(null)}
                onPlayFromHere={(nodeId) => {
                  setCurrentNodeId(nodeId);
                  setViewMode('play');
                }}
                flagSchema={flagSchema}
              />
            )}
          </>
        )}

        {/* Yarn View */}
        {viewMode === 'yarn' && (
          <YarnView dialogue={dialogueTree} onExport={handleExportYarn} />
        )}

        {/* Play View */}
        {viewMode === 'play' && (
          <PlayView 
            dialogue={dialogueTree} 
            startNodeId={currentNodeId}
            flagSchema={flagSchema}
            initialFlags={{}}
          />
        )}
      </div>

      {/* Guide Panel */}
      <GuidePanel isOpen={showGuide} onClose={() => setShowGuide(false)} />
      
      {/* Flag Manager */}
      {showFlagManager && (
        <FlagManager 
          flagSchema={flagSchema}
          dialogue={dialogueTree}
          onUpdate={(updated) => {
            setFlagSchema(updated);
            setHasChanges(true);
          }}
          onClose={() => setShowFlagManager(false)}
        />
      )}
    </div>
  );
}
