import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DialogueTree, Choice } from '../types';
import { FlagSchema, FlagType } from '../types/flags';
import { GameFlagState } from '../types/game-state';
import { mergeFlagUpdates } from '../lib/flag-manager';
import { CONDITION_OPERATOR } from '../types/constants';

interface HistoryEntry {
  nodeId: string;
  type: 'npc' | 'player';
  speaker?: string;
  content: string;
}

interface PlayViewProps {
  dialogue: DialogueTree;
  startNodeId?: string;
  flagSchema?: FlagSchema;
  initialFlags?: GameFlagState;
}

export function PlayView({ dialogue, startNodeId, flagSchema, initialFlags }: PlayViewProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(startNodeId || dialogue.startNodeId);
  const [memoryFlags, setMemoryFlags] = useState<Set<string>>(new Set());
  const [gameFlags, setGameFlags] = useState<GameFlagState>(initialFlags || {});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Track which flags were set during this run
  const [flagsSetDuringRun, setFlagsSetDuringRun] = useState<Set<string>>(new Set());

  // Process current node
  useEffect(() => {
    const node = dialogue.nodes[currentNodeId];
    if (!node || node.type !== 'npc') return;

    setIsTyping(true);
    const timer = setTimeout(() => {
      if (node.setFlags) {
        // Update dialogue flags (temporary)
        setMemoryFlags(prev => {
          const next = new Set(prev);
          node.setFlags!.forEach(f => next.add(f));
          return next;
        });
        
        // Update game flags (persistent)
        if (flagSchema) {
          const gameFlagIds = node.setFlags.filter(flagId => {
            const flag = flagSchema.flags.find(f => f.id === flagId);
            return flag && flag.type !== 'dialogue';
          });
          
          if (gameFlagIds.length > 0) {
            setGameFlags(prev => {
              const updated = mergeFlagUpdates(prev, gameFlagIds, flagSchema);
              return updated;
            });
            setFlagsSetDuringRun(prev => {
              const next = new Set(prev);
              gameFlagIds.forEach(f => next.add(f));
              return next;
            });
          }
        }
      }
      
      setHistory(prev => [...prev, {
        nodeId: node.id,
        type: 'npc',
        speaker: node.speaker,
        content: node.content
      }]);
      
      setIsTyping(false);
      
      if (node.nextNodeId) {
        setTimeout(() => setCurrentNodeId(node.nextNodeId!), 300);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentNodeId, dialogue]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  const currentNode = dialogue.nodes[currentNodeId];
  
  // Filter choices based on conditions
  const availableChoices = currentNode?.choices?.filter(choice => {
    if (!choice.conditions) return true;
    return choice.conditions.every(cond => {
      const flagValue = gameFlags[cond.flag] ?? (memoryFlags.has(cond.flag) ? true : undefined);
      
      switch (cond.operator) {
        case CONDITION_OPERATOR.IS_SET:
          return flagValue !== undefined && flagValue !== false && flagValue !== 0 && flagValue !== '';
        case CONDITION_OPERATOR.IS_NOT_SET:
          return flagValue === undefined || flagValue === false || flagValue === 0 || flagValue === '';
        case CONDITION_OPERATOR.EQUALS:
          return flagValue === cond.value;
        case CONDITION_OPERATOR.NOT_EQUALS:
          return flagValue !== cond.value;
        case CONDITION_OPERATOR.GREATER_THAN:
          return typeof flagValue === 'number' && typeof cond.value === 'number' && flagValue > cond.value;
        case CONDITION_OPERATOR.LESS_THAN:
          return typeof flagValue === 'number' && typeof cond.value === 'number' && flagValue < cond.value;
        case CONDITION_OPERATOR.GREATER_EQUAL:
          return typeof flagValue === 'number' && typeof cond.value === 'number' && flagValue >= cond.value;
        case CONDITION_OPERATOR.LESS_EQUAL:
          return typeof flagValue === 'number' && typeof cond.value === 'number' && flagValue <= cond.value;
        default:
          return true;
      }
    });
  }) || [];

  const handleChoice = (choice: Choice) => {
    setHistory(prev => [...prev, {
      nodeId: choice.id,
      type: 'player',
      content: choice.text
    }]);
    
    if (choice.setFlags) {
      // Update dialogue flags (temporary)
      setMemoryFlags(prev => {
        const next = new Set(prev);
        choice.setFlags!.forEach(f => next.add(f));
        return next;
      });
      
      // Update game flags (persistent)
      if (flagSchema) {
        const gameFlagIds = choice.setFlags.filter(flagId => {
          const flag = flagSchema.flags.find(f => f.id === flagId);
          return flag && flag.type !== 'dialogue';
        });
        
        if (gameFlagIds.length > 0) {
          setGameFlags(prev => {
            const updated = mergeFlagUpdates(prev, gameFlagIds, flagSchema);
            return updated;
          });
          setFlagsSetDuringRun(prev => {
            const next = new Set(prev);
            gameFlagIds.forEach(f => next.add(f));
            return next;
          });
        }
      }
    }
    
    setCurrentNodeId(choice.nextNodeId);
  };

  const handleRestart = () => {
    setHistory([]);
    setMemoryFlags(new Set());
    setGameFlags(initialFlags || {});
    setFlagsSetDuringRun(new Set());
    setCurrentNodeId(startNodeId || dialogue.startNodeId);
  };
  
  // Get all non-dialogue flags from schema
  const gameFlagsList = useMemo(() => {
    if (!flagSchema) return [];
    return flagSchema.flags.filter(f => f.type !== 'dialogue');
  }, [flagSchema]);
  
  const flagTypeColors: Record<FlagType, string> = {
    dialogue: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    quest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    achievement: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    item: 'bg-green-500/20 text-green-400 border-green-500/30',
    stat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    title: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    global: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <main className="flex-1 flex flex-col relative">
      {/* Debug Toggle Button */}
      {flagSchema && (
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#2a2a3e] border border-[#2a2a3e] hover:border-[#e94560] text-gray-400 hover:text-white text-xs rounded-lg transition-colors flex items-center gap-2"
          title="Toggle Flag Debug Panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 15h6M9 12h6" />
          </svg>
          {showDebugPanel ? 'Hide' : 'Debug'} Flags
        </button>
      )}
      
      {/* Debug Panel */}
      {showDebugPanel && flagSchema && (
        <div className="absolute top-12 right-4 w-80 bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-xl z-20 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-[#1a1a2e] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Flag Debug Panel</h3>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Flags Set During Run */}
            {flagsSetDuringRun.size > 0 && (
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-2">Flags Set This Run ({flagsSetDuringRun.size})</h4>
                <div className="space-y-1">
                  {Array.from(flagsSetDuringRun).map(flagId => {
                    const flag = flagSchema.flags.find(f => f.id === flagId);
                    if (!flag) return null;
                    const value = gameFlags[flagId];
                    return (
                      <div key={flagId} className="bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${flagTypeColors[flag.type]}`}>
                            {flag.type}
                          </span>
                          <span className="font-mono text-white flex-1 truncate">{flagId}</span>
                          {value !== undefined && (
                            <span className="text-gray-400">
                              = {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* All Game Flags */}
            <div>
              <h4 className="text-xs text-gray-500 uppercase mb-2">All Game Flags ({gameFlagsList.length})</h4>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {gameFlagsList.map(flag => {
                  const value = gameFlags[flag.id];
                  const wasSet = flagsSetDuringRun.has(flag.id);
                  const hasValue = value !== undefined;
                  
                  return (
                    <div 
                      key={flag.id} 
                      className={`bg-[#12121a] border rounded px-2 py-1.5 text-xs transition-colors ${
                        wasSet ? 'border-[#e94560]/50 bg-[#e94560]/5' : 'border-[#2a2a3e]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${flagTypeColors[flag.type]}`}>
                          {flag.type}
                        </span>
                        <span className="font-mono text-white flex-1 truncate text-[10px]">{flag.id}</span>
                        {wasSet && (
                          <span className="text-[10px] px-1 py-0.5 bg-[#e94560]/20 text-[#e94560] rounded">NEW</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-[10px] truncate">{flag.name}</div>
                      {hasValue ? (
                        <div className="mt-1 text-[10px] text-gray-300">
                          <span className="text-gray-500">Value: </span>
                          <span className="font-mono">
                            {typeof value === 'boolean' ? (value ? 'true' : 'false') : 
                             typeof value === 'number' ? value : 
                             `"${value}"`}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-[10px] text-gray-600 italic">Not set</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            <p className="text-gray-500 mb-3">End of dialogue</p>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
