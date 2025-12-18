'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RotateCcw, Save, Trash2, ChevronRight, X, Check, GitBranch, MessageSquare, Play, Download, Upload, FileText, Code } from 'lucide-react';

// Types
interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  conditions?: { flag: string; operator: 'is_set' | 'is_not_set' }[];
  setFlags?: string[];
}

interface DialogueNode {
  id: string;
  type: 'npc' | 'player';
  speaker?: string;
  content: string;
  choices?: Choice[];
  nextNodeId?: string;
  setFlags?: string[];
  x: number;
  y: number;
}

interface DialogueTree {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

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
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

const defaultDialogue: DialogueTree = {
  id: 'new-dialogue',
  title: 'New Dialogue',
  startNodeId: 'start',
  nodes: {
    'start': {
      id: 'start', type: 'npc', speaker: 'Character', x: 300, y: 100,
      content: "Hello! This is the start of your dialogue."
    }
  }
};

// Convert to Yarn Spinner format
function exportToYarn(tree: DialogueTree): string {
  let yarn = '';
  
  Object.values(tree.nodes).forEach(node => {
    yarn += `title: ${node.id}\n`;
    yarn += `---\n`;
    
    if (node.type === 'npc') {
      if (node.speaker) {
        yarn += `${node.speaker}: ${node.content.replace(/\n/g, '\n' + node.speaker + ': ')}\n`;
      } else {
        yarn += `${node.content}\n`;
      }
      
      if (node.setFlags?.length) {
        node.setFlags.forEach(flag => {
          yarn += `<<set $${flag} = true>>\n`;
        });
      }
      
      if (node.nextNodeId) {
        yarn += `<<jump ${node.nextNodeId}>>\n`;
      }
    } else if (node.type === 'player' && node.choices) {
      node.choices.forEach(choice => {
        yarn += `-> ${choice.text}\n`;
        if (choice.setFlags?.length) {
          choice.setFlags.forEach(flag => {
            yarn += `    <<set $${flag} = true>>\n`;
          });
        }
        if (choice.nextNodeId) {
          yarn += `    <<jump ${choice.nextNodeId}>>\n`;
        }
      });
    }
    
    yarn += `===\n\n`;
  });
  
  return yarn;
}

// Parse Yarn Spinner format (basic)
function importFromYarn(yarnContent: string): DialogueTree {
  const nodes: Record<string, DialogueNode> = {};
  const nodeBlocks = yarnContent.split('===').filter(b => b.trim());
  
  let y = 50;
  nodeBlocks.forEach((block, idx) => {
    const titleMatch = block.match(/title:\s*(\S+)/);
    if (!titleMatch) return;
    
    const nodeId = titleMatch[1];
    const contentStart = block.indexOf('---');
    if (contentStart === -1) return;
    
    const content = block.slice(contentStart + 3).trim();
    const lines = content.split('\n').filter(l => l.trim());
    
    const choices: Choice[] = [];
    let dialogueContent = '';
    let speaker = '';
    const setFlags: string[] = [];
    let nextNodeId = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('->')) {
        const choiceText = trimmed.slice(2).trim();
        choices.push({ id: `c_${Date.now()}_${choices.length}`, text: choiceText, nextNodeId: '' });
      } else if (trimmed.startsWith('<<jump')) {
        const jumpMatch = trimmed.match(/<<jump\s+(\S+)>>/);
        if (jumpMatch) {
          if (choices.length > 0) {
            choices[choices.length - 1].nextNodeId = jumpMatch[1];
          } else {
            nextNodeId = jumpMatch[1];
          }
        }
      } else if (trimmed.startsWith('<<set')) {
        const setMatch = trimmed.match(/<<set\s+\$(\w+)/);
        if (setMatch) {
          if (choices.length > 0) {
            choices[choices.length - 1].setFlags = [...(choices[choices.length - 1].setFlags || []), setMatch[1]];
          } else {
            setFlags.push(setMatch[1]);
          }
        }
      } else if (trimmed.includes(':') && !trimmed.startsWith('<<')) {
        const [spk, ...rest] = trimmed.split(':');
        speaker = spk.trim();
        dialogueContent += rest.join(':').trim() + '\n';
      } else if (!trimmed.startsWith('<<')) {
        dialogueContent += trimmed + '\n';
      }
    });
    
    nodes[nodeId] = {
      id: nodeId,
      type: choices.length > 0 ? 'player' : 'npc',
      speaker: speaker || undefined,
      content: dialogueContent.trim(),
      choices: choices.length > 0 ? choices : undefined,
      nextNodeId: nextNodeId || undefined,
      setFlags: setFlags.length > 0 ? setFlags : undefined,
      x: (idx % 3) * 250,
      y: y + Math.floor(idx / 3) * 180
    };
  });
  
  const startNodeId = Object.keys(nodes)[0] || 'start';
  
  return {
    id: 'imported',
    title: 'Imported Dialogue',
    startNodeId,
    nodes
  };
}

export default function DialogueForgePage() {
  const [dialogueTree, setDialogueTree] = useState<DialogueTree>(defaultDialogue);
  const [currentNodeId, setCurrentNodeId] = useState<string>(defaultDialogue.startNodeId);
  const [memoryFlags, setMemoryFlags] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'play' | 'yarn'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [graphOffset, setGraphOffset] = useState({ x: 150, y: 30 });
  const [graphScale, setGraphScale] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<DraggingEdge | null>(null);
  const [edgeDropMenu, setEdgeDropMenu] = useState<{ x: number; y: number; graphX: number; graphY: number; fromNodeId: string; fromChoiceIdx?: number } | null>(null);
  const skipNextClick = useRef(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  // Chat playback
  useEffect(() => {
    if (viewMode !== 'play') return;
    const node = dialogueTree.nodes[currentNodeId];
    if (!node || node.type !== 'npc') return;

    setIsTyping(true);
    const timer = setTimeout(() => {
      if (node.setFlags) {
        setMemoryFlags(prev => {
          const next = new Set(prev);
          node.setFlags!.forEach(f => next.add(f));
          return next;
        });
      }
      setHistory(prev => [...prev, { nodeId: node.id, type: 'npc', speaker: node.speaker, content: node.content }]);
      setIsTyping(false);
      if (node.nextNodeId) setTimeout(() => setCurrentNodeId(node.nextNodeId!), 300);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentNodeId, dialogueTree, viewMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

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

  const currentNode = dialogueTree.nodes[currentNodeId];
  const selectedNode = selectedNodeId ? dialogueTree.nodes[selectedNodeId] : null;

  const availableChoices = currentNode?.choices?.filter(choice => {
    if (!choice.conditions) return true;
    return choice.conditions.every(cond => {
      const hasFlag = memoryFlags.has(cond.flag);
      return cond.operator === 'is_set' ? hasFlag : !hasFlag;
    });
  }) || [];

  const handleChoice = (choice: Choice) => {
    setHistory(prev => [...prev, { nodeId: choice.id, type: 'player', content: choice.text }]);
    if (choice.setFlags) {
      setMemoryFlags(prev => {
        const next = new Set(prev);
        choice.setFlags!.forEach(f => next.add(f));
        return next;
      });
    }
    setCurrentNodeId(choice.nextNodeId);
  };

  const handleRestart = () => {
    setHistory([]);
    setMemoryFlags(new Set());
    setCurrentNodeId(dialogueTree.startNodeId);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dialogueTree));
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        if (file.name.endsWith('.yarn')) {
          setDialogueTree(importFromYarn(content));
        } else {
          setDialogueTree(JSON.parse(content));
        }
        setHasChanges(true);
        handleRestart();
      } catch (err) {
        alert('Failed to import file');
      }
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
    const lines: JSX.Element[] = [];
    
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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
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
            <Link href="/docs/dialogue-forge/getting-started" className="p-2 text-gray-400 hover:text-white" title="Docs">
              <BookOpen size={16} />
            </Link>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" title="Import">
              <Upload size={16} />
            </button>
            <input ref={fileInputRef} type="file" accept=".json,.yarn" onChange={handleImport} className="hidden" />
            <button onClick={handleExportJSON} className="p-2 text-gray-400 hover:text-white" title="Export JSON">
              <Download size={16} />
            </button>
            <button onClick={handleExportYarn} className="p-2 text-gray-400 hover:text-white" title="Export Yarn">
              <FileText size={16} />
            </button>
            <button onClick={handleRestart} className="p-2 text-gray-400 hover:text-white" title="Restart">
              <RotateCcw size={16} />
            </button>
            <button onClick={handleSave} className={`p-2 rounded ${saved ? 'text-green-400' : hasChanges ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}>
              {saved ? <Check size={16} /> : <Save size={16} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
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
                    onClick={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); setContextMenu(null); }}
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
                              <span className="truncate flex-1">{choice.text.slice(0, 25)}...</span>
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
              <div className="absolute bottom-3 right-3 text-[10px] text-gray-600">
                Right-click to add nodes • Drag ports to connect • Scroll to zoom
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

            {/* Node Editor Panel */}
            {selectedNode && (
              <aside className="w-80 border-l border-[#1a1a2e] bg-[#0d0d14] overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded ${selectedNode.type === 'npc' ? 'bg-[#e94560]/20 text-[#e94560]' : 'bg-purple-500/20 text-purple-400'}`}>
                      {selectedNode.type === 'npc' ? 'NPC' : 'PLAYER'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => deleteNode(selectedNode.id)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                      <button onClick={() => setSelectedNodeId(null)} className="p-1 text-gray-500 hover:text-white"><X size={14} /></button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">ID</label>
                    <input value={selectedNode.id} disabled className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-500 font-mono" />
                  </div>

                  {selectedNode.type === 'npc' && (
                    <>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase">Speaker</label>
                        <input
                          value={selectedNode.speaker || ''}
                          onChange={(e) => updateNode(selectedNode.id, { speaker: e.target.value })}
                          className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#e94560] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase">Content</label>
                        <textarea
                          value={selectedNode.content}
                          onChange={(e) => updateNode(selectedNode.id, { content: e.target.value })}
                          className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#e94560] outline-none min-h-[100px] resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase">Next Node</label>
                        <select
                          value={selectedNode.nextNodeId || ''}
                          onChange={(e) => updateNode(selectedNode.id, { nextNodeId: e.target.value || undefined })}
                          className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 outline-none"
                        >
                          <option value="">— End —</option>
                          {Object.keys(dialogueTree.nodes).filter(id => id !== selectedNode.id).map(id => (
                            <option key={id} value={id}>{id}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {selectedNode.type === 'player' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] text-gray-500 uppercase">Choices</label>
                        <button onClick={() => addChoice(selectedNode.id)} className="text-[10px] text-[#e94560]">+ Add</button>
                      </div>
                      <div className="space-y-2">
                        {selectedNode.choices?.map((choice, idx) => (
                          <div key={choice.id} className="bg-[#12121a] border border-[#2a2a3e] rounded p-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                value={choice.text}
                                onChange={(e) => updateChoice(selectedNode.id, idx, { text: e.target.value })}
                                className="flex-1 bg-transparent text-sm text-gray-200 outline-none"
                                placeholder="Choice text..."
                              />
                              <button onClick={() => deleteChoice(selectedNode.id, idx)} className="text-gray-600 hover:text-red-400">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <select
                              value={choice.nextNodeId}
                              onChange={(e) => updateChoice(selectedNode.id, idx, { nextNodeId: e.target.value })}
                              className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-300 outline-none"
                            >
                              <option value="">— Select target —</option>
                              {Object.keys(dialogueTree.nodes).map(id => <option key={id} value={id}>{id}</option>)}
                            </select>
                            <input
                              value={choice.setFlags?.join(', ') || ''}
                              onChange={(e) => updateChoice(selectedNode.id, idx, { setFlags: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined })}
                              className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1 text-[10px] text-gray-400 outline-none font-mono"
                              placeholder="Set flags..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">Set Flags (on enter)</label>
                    <input
                      value={selectedNode.setFlags?.join(', ') || ''}
                      onChange={(e) => updateNode(selectedNode.id, { setFlags: e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined })}
                      className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 outline-none font-mono"
                      placeholder="flag1, flag2"
                    />
                  </div>

                  <button
                    onClick={() => { setCurrentNodeId(selectedNode.id); setViewMode('play'); handleRestart(); }}
                    className="w-full py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded text-sm flex items-center justify-center gap-2"
                  >
                    <Play size={14} /> Play from Here
                  </button>
                </div>
              </aside>
            )}
          </>
        )}

        {/* Yarn View */}
        {viewMode === 'yarn' && (
          <main className="flex-1 flex flex-col bg-[#0d0d14]">
            <div className="border-b border-[#1a1a2e] px-4 py-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Yarn Spinner Output</span>
              <button
                onClick={handleExportYarn}
                className="px-3 py-1.5 bg-[#e94560] hover:bg-[#d63850] text-white text-sm rounded flex items-center gap-2"
              >
                <Download size={14} /> Download .yarn
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap bg-[#08080c] rounded-lg p-4 border border-[#1a1a2e]">
                {exportToYarn(dialogueTree)}
              </pre>
            </div>
          </main>
        )}

        {/* Play View */}
        {viewMode === 'play' && (
          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-4">
                {history.map((entry, idx) => (
                  <div key={idx} className={`flex ${entry.type === 'player' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      entry.type === 'player' ? 'bg-[#e94560] text-white rounded-br-md' : 'bg-[#1a1a2e] text-gray-100 rounded-bl-md'
                    }`}>
                      {entry.type === 'npc' && entry.speaker && <div className="text-xs text-[#e94560] font-medium mb-1">{entry.speaker}</div>}
                      <div className="whitespace-pre-wrap">{entry.content}</div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1a1a2e] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                      <span className="w-2 h-2 bg-[#e94560] rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-[#e94560] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#e94560] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {currentNode?.type === 'player' && !isTyping && availableChoices.length > 0 && (
              <div className="border-t border-[#1a1a2e] bg-[#0d0d14]/80 p-4">
                <div className="max-w-2xl mx-auto space-y-2">
                  {availableChoices.map(choice => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(choice)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-[#2a2a3e] hover:border-[#e94560] bg-[#12121a] text-gray-200 flex items-center justify-between"
                    >
                      <span>{choice.text}</span>
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentNode?.type === 'npc' && !currentNode.nextNodeId && !isTyping && (
              <div className="border-t border-[#1a1a2e] p-4 text-center">
                <p className="text-gray-500 mb-3">End of dialogue</p>
                <button onClick={handleRestart} className="px-4 py-2 bg-[#e94560] text-white rounded-lg">Play Again</button>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
