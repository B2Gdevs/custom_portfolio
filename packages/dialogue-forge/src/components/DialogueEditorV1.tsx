import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DialogueEditorProps, DialogueTree, DialogueNode } from '../types';
import { exportToYarn, importFromYarn } from '../lib/yarn-converter';
import { createNode, deleteNodeFromTree, addChoiceToNode, removeChoiceFromNode, updateChoiceInNode } from '../utils/node-helpers';
import { NODE_WIDTH, NODE_HEIGHT, DEFAULT_GRAPH_SCALE, MIN_SCALE, MAX_SCALE } from '../utils/constants';
import { GraphViewV1 } from './GraphViewV1';
import { NodeEditor } from './NodeEditor';
import { YarnView } from './YarnView';
import { PlayView } from './PlayView';

type ViewMode = 'graph' | 'yarn' | 'play';

export function DialogueEditorV1({
  dialogue,
  onChange,
  onExportYarn,
  onExportJSON,
  className = '',
  showTitleEditor = true
}: DialogueEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [graphOffset, setGraphOffset] = useState({ x: 150, y: 30 });
  const [graphScale, setGraphScale] = useState(DEFAULT_GRAPH_SCALE);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; graphX: number; graphY: number } | null>(null);
  const [edgeDropMenu, setEdgeDropMenu] = useState<{ x: number; y: number; graphX: number; graphY: number; fromNodeId: string; fromChoiceIdx?: number } | null>(null);
  const [draggingEdge, setDraggingEdge] = useState<{ fromNodeId: string; fromChoiceIdx?: number; startX: number; startY: number; endX: number; endY: number } | null>(null);
  const skipNextClick = useRef(false);

  if (!dialogue) {
    return (
      <div className={`dialogue-editor-empty ${className}`}>
        <p>No dialogue loaded. Please provide a dialogue tree.</p>
      </div>
    );
  }

  const selectedNode = selectedNodeId ? dialogue.nodes[selectedNodeId] : null;

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<DialogueNode>) => {
    onChange({
      ...dialogue,
      nodes: {
        ...dialogue.nodes,
        [nodeId]: { ...dialogue.nodes[nodeId], ...updates }
      }
    });
  }, [dialogue, onChange]);

  const handleAddNode = useCallback((type: 'npc' | 'player', x: number, y: number) => {
    const newId = `${type}_${Date.now()}`;
    const newNode = createNode(type, newId, x, y);
    onChange({
      ...dialogue,
      nodes: { ...dialogue.nodes, [newId]: newNode }
    });
    setSelectedNodeId(newId);
    setContextMenu(null);
    return newId;
  }, [dialogue, onChange]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    try {
      onChange(deleteNodeFromTree(dialogue, nodeId));
      setSelectedNodeId(null);
    } catch (e: any) {
      alert(e.message);
    }
  }, [dialogue, onChange]);

  const handleAddChoice = useCallback((nodeId: string) => {
    const updated = addChoiceToNode(dialogue.nodes[nodeId]);
    handleUpdateNode(nodeId, updated);
  }, [dialogue, handleUpdateNode]);

  const handleUpdateChoice = useCallback((nodeId: string, choiceIdx: number, updates: any) => {
    const updated = updateChoiceInNode(dialogue.nodes[nodeId], choiceIdx, updates);
    handleUpdateNode(nodeId, updated);
  }, [dialogue, handleUpdateNode]);

  const handleRemoveChoice = useCallback((nodeId: string, choiceIdx: number) => {
    const updated = removeChoiceFromNode(dialogue.nodes[nodeId], choiceIdx);
    handleUpdateNode(nodeId, updated);
  }, [dialogue, handleUpdateNode]);

  const handleExportYarnClick = () => {
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
  };

  const handleExportJSONClick = () => {
    const json = JSON.stringify(dialogue, null, 2);
    if (onExportJSON) {
      onExportJSON(json);
    } else {
      // Default: download file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dialogue.title.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportYarn = (yarnContent: string) => {
    const imported = importFromYarn(yarnContent, dialogue?.title || 'Imported Dialogue');
    onChange(imported);
  };

  return (
    <div className={`dialogue-editor ${className}`}>
      <GraphViewV1
        dialogue={dialogue}
        viewMode={viewMode}
        selectedNodeId={selectedNodeId}
        graphOffset={graphOffset}
        graphScale={graphScale}
        contextMenu={contextMenu}
        edgeDropMenu={edgeDropMenu}
        draggingEdge={draggingEdge}
        onSelectNode={setSelectedNodeId}
        onUpdateNode={handleUpdateNode}
        onAddNode={handleAddNode}
        onDeleteNode={handleDeleteNode}
        onSetGraphOffset={setGraphOffset}
        onSetGraphScale={setGraphScale}
        onSetContextMenu={setContextMenu}
        onSetEdgeDropMenu={setEdgeDropMenu}
        onSetDraggingEdge={setDraggingEdge}
        onStartEdgeDrag={(nodeId: string, choiceIdx?: number) => {
          const node = dialogue.nodes[nodeId];
          const startX = node.x + NODE_WIDTH / 2;
          const startY = node.y + NODE_HEIGHT + (choiceIdx !== undefined ? 20 + choiceIdx * 24 : 0);
          setDraggingEdge({ fromNodeId: nodeId, fromChoiceIdx: choiceIdx, startX, startY, endX: startX, endY: startY + 50 });
        }}
        skipNextClick={skipNextClick}
      />
      
      {selectedNode && viewMode === 'graph' && (
        <NodeEditor
          node={selectedNode}
          dialogue={dialogue}
          onUpdate={(updates) => handleUpdateNode(selectedNode.id, updates)}
          onDelete={() => handleDeleteNode(selectedNode.id)}
          onAddChoice={() => handleAddChoice(selectedNode.id)}
          onUpdateChoice={(idx, updates) => handleUpdateChoice(selectedNode.id, idx, updates)}
          onRemoveChoice={(idx) => handleRemoveChoice(selectedNode.id, idx)}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {viewMode === 'yarn' && (
        <YarnView
          dialogue={dialogue}
          onExport={handleExportYarnClick}
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

