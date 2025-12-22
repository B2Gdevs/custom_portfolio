import React, { useState, useEffect, useRef } from 'react';
import { DialogueTree, DialogueNode, Choice } from '../types';
import { GameFlagState, DialogueResult } from '../types/game-state';
import { mergeFlagUpdates } from '../lib/flag-manager';

interface DialogueSimulatorProps {
  dialogue: DialogueTree;
  initialFlags: GameFlagState;
  startNodeId?: string;
  onComplete: (result: DialogueResult) => void;
  onFlagUpdate?: (flags: GameFlagState) => void;
}

interface HistoryEntry {
  nodeId: string;
  type: 'npc' | 'player';
  speaker?: string;
  content: string;
}

export function DialogueSimulator({
  dialogue,
  initialFlags,
  startNodeId,
  onComplete,
  onFlagUpdate
}: DialogueSimulatorProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(startNodeId || dialogue.startNodeId);
  const [flags, setFlags] = useState<GameFlagState>(initialFlags);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Process current node
  useEffect(() => {
    const node = dialogue.nodes[currentNodeId];
    if (!node || node.type !== 'npc') return;

    setIsTyping(true);
    const timer = setTimeout(() => {
      // Mark as visited
      setVisitedNodes(prev => new Set([...prev, node.id]));
      
      // Update flags
      if (node.setFlags && node.setFlags.length > 0) {
        const updated = mergeFlagUpdates(flags, node.setFlags);
        setFlags(updated);
        onFlagUpdate?.(updated);
      }
      
      // Add to history
      setHistory(prev => [...prev, {
        nodeId: node.id,
        type: 'npc',
        speaker: node.speaker,
        content: node.content
      }]);
      
      setIsTyping(false);
      
      // Auto-advance if there's a next node
      if (node.nextNodeId) {
        setTimeout(() => setCurrentNodeId(node.nextNodeId!), 300);
      } else {
        // Dialogue complete
        onComplete({
          updatedFlags: flags,
          dialogueTree: dialogue,
          completedNodeIds: Array.from(visitedNodes)
        });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentNodeId, dialogue]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  const currentNode = dialogue.nodes[currentNodeId];
  
  // Filter choices based on conditions and flags
  const availableChoices = currentNode?.choices?.filter(choice => {
    if (!choice.conditions) return true;
    return choice.conditions.every(cond => {
      const flagValue = flags[cond.flag];
      const hasFlag = flagValue !== undefined && flagValue !== false && flagValue !== 0 && flagValue !== '';
      
      return cond.operator === 'is_set' ? hasFlag : !hasFlag;
    });
  }) || [];

  const handleChoice = (choice: Choice) => {
    // Add to history
    setHistory(prev => [...prev, {
      nodeId: choice.id,
      type: 'player',
      content: choice.text
    }]);
    
    // Update flags
    if (choice.setFlags && choice.setFlags.length > 0) {
      const updated = mergeFlagUpdates(flags, choice.setFlags);
      setFlags(updated);
      onFlagUpdate?.(updated);
    }
    
    // Move to next node
    if (choice.nextNodeId) {
      setCurrentNodeId(choice.nextNodeId);
    } else {
      // Choice leads nowhere - dialogue complete
      onComplete({
        updatedFlags: flags,
        dialogueTree: dialogue,
        completedNodeIds: Array.from(visitedNodes)
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {history.map((entry, idx) => (
            <div key={idx} className={`flex ${entry.type === 'player' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                entry.type === 'player' 
                  ? 'bg-[#e94560] text-white rounded-br-md' 
                  : 'bg-[#1a1a2e] text-gray-100 rounded-bl-md'
              }`}>
                {entry.type === 'npc' && entry.speaker && (
                  <div className="text-xs text-[#e94560] font-medium mb-1">{entry.speaker}</div>
                )}
                <div className="whitespace-pre-wrap">{entry.content}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a2e] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#e94560] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#e94560] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#e94560] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </div>

      {currentNode?.type === 'player' && !isTyping && availableChoices.length > 0 && (
        <div className="border-t border-[#1a1a2e] bg-[#0d0d14]/80 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto space-y-2">
            {availableChoices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="w-full text-left px-4 py-3 rounded-lg border border-[#2a2a3e] hover:border-[#e94560] bg-[#12121a] hover:bg-[#1a1a2e] text-gray-200 transition-all group flex items-center justify-between"
              >
                <span>{choice.text}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 group-hover:text-[#e94560] transition-colors">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentNode?.type === 'npc' && !currentNode.nextNodeId && !isTyping && (
        <div className="border-t border-[#1a1a2e] bg-[#0d0d14]/80 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500 mb-3">Dialogue complete</p>
            <button
              onClick={() => onComplete({
                updatedFlags: flags,
                dialogueTree: dialogue,
                completedNodeIds: Array.from(visitedNodes)
              })}
              className="px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



