import React from 'react';
import { DialogueNode, DialogueTree, Choice } from '../types';
import { FlagSchema } from '../types/flags';
import { FlagSelector } from './FlagSelector';

interface NodeEditorProps {
  node: DialogueNode;
  dialogue: DialogueTree;
  onUpdate: (updates: Partial<DialogueNode>) => void;
  onDelete: () => void;
  onAddChoice: () => void;
  onUpdateChoice: (idx: number, updates: Partial<Choice>) => void;
  onRemoveChoice: (idx: number) => void;
  onClose: () => void;
  onPlayFromHere?: (nodeId: string) => void;
  flagSchema?: FlagSchema;
}

export function NodeEditor({
  node,
  dialogue,
  onUpdate,
  onDelete,
  onAddChoice,
  onUpdateChoice,
  onRemoveChoice,
  onClose,
  onPlayFromHere,
  flagSchema
}: NodeEditorProps) {
  return (
    <aside className="w-80 border-l border-[#1a1a2e] bg-[#0d0d14] overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded ${node.type === 'npc' ? 'bg-[#e94560]/20 text-[#e94560]' : 'bg-purple-500/20 text-purple-400'}`}>
            {node.type === 'npc' ? 'NPC' : 'PLAYER'}
          </span>
          <div className="flex gap-1">
            <button onClick={onDelete} className="p-1 text-gray-500 hover:text-red-400" title="Delete node">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white" title="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase">ID</label>
          <input 
            value={node.id} 
            disabled 
            className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-500 font-mono" 
          />
        </div>

        {node.type === 'npc' && (
          <>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Speaker</label>
              <input
                type="text"
                value={node.speaker || ''}
                onChange={(e) => onUpdate({ speaker: e.target.value })}
                className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#e94560] outline-none"
                placeholder="Character name"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Content</label>
              <textarea
                value={node.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#e94560] outline-none min-h-[100px] resize-y"
                placeholder="What the character says..."
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Next Node</label>
              <select
                value={node.nextNodeId || ''}
                onChange={(e) => onUpdate({ nextNodeId: e.target.value || undefined })}
                className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 outline-none"
              >
                <option value="">— End —</option>
                {Object.keys(dialogue.nodes).filter(id => id !== node.id).map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {node.type === 'player' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-gray-500 uppercase">Choices</label>
              <button onClick={onAddChoice} className="text-[10px] text-[#e94560] hover:text-[#ff6b6b]">
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {node.choices?.map((choice, idx) => (
                <div key={choice.id} className="bg-[#12121a] border border-[#2a2a3e] rounded p-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => onUpdateChoice(idx, { text: e.target.value })}
                      className="flex-1 bg-transparent text-sm text-gray-200 outline-none"
                      placeholder="Choice text..."
                    />
                    <button 
                      onClick={() => onRemoveChoice(idx)} 
                      className="text-gray-600 hover:text-red-400"
                      title="Remove choice"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  <select
                    value={choice.nextNodeId}
                    onChange={(e) => onUpdateChoice(idx, { nextNodeId: e.target.value })}
                    className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-300 outline-none"
                  >
                    <option value="">— Select target —</option>
                    {Object.keys(dialogue.nodes).map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                  <FlagSelector
                    value={choice.setFlags || []}
                    onChange={(flags) => onUpdateChoice(idx, { setFlags: flags.length > 0 ? flags : undefined })}
                    flagSchema={flagSchema}
                    placeholder="Set flags..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] text-gray-500 uppercase">Set Flags (on enter)</label>
          <FlagSelector
            value={node.setFlags || []}
            onChange={(flags) => onUpdate({ setFlags: flags.length > 0 ? flags : undefined })}
            flagSchema={flagSchema}
            placeholder="flag1, flag2"
          />
        </div>

        {onPlayFromHere && (
          <button
            onClick={() => onPlayFromHere(node.id)}
            className="w-full py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded text-sm flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Play from Here
          </button>
        )}
      </div>
    </aside>
  );
}
