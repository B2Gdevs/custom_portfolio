import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNode } from '../types';
import { MessageSquare } from 'lucide-react';
import { FlagSchema } from '../types/flags';

interface NPCNodeData {
  node: DialogueNode;
  flagSchema?: FlagSchema;
}

export function NPCNodeV2({ data, selected }: NodeProps<NPCNodeData>) {
  const { node, flagSchema } = data;

  return (
    <div className={`rounded-lg border-2 transition-all ${
      selected ? 'border-[#e94560] shadow-lg shadow-[#e94560]/20' : 'border-[#4a1a1a]'
    } bg-[#1a1a2e] min-w-[200px]`}>
      {/* Input handle at top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-[#2a2a3e] !border-[#4a4a6a] !w-4 !h-4 !rounded-full"
      />
      
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-[#2a2a3e] bg-[#12121a] flex items-center gap-2 rounded-t-lg">
        <MessageSquare size={12} className="text-[#e94560]" />
        <span className="text-[10px] font-mono text-gray-500 truncate flex-1">{node.id}</span>
        <span className="text-[10px] text-gray-600">NPC</span>
      </div>
      
      {/* Content */}
      <div className="px-3 py-2 min-h-[50px]">
        {node.speaker && (
          <div className="text-[10px] text-[#e94560] font-medium mb-1">{node.speaker}</div>
        )}
        <div className="text-xs text-gray-300 line-clamp-2 bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1">
          &quot;{node.content.slice(0, 60) + (node.content.length > 60 ? '...' : '')}&quot;
        </div>
        
        {/* Flag indicators */}
        {node.setFlags && node.setFlags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {node.setFlags.map(flagId => {
              const flag = flagSchema?.flags.find(f => f.id === flagId);
              // If flag not found in schema, show as grey (dialogue/temporary)
              // If flag found, use its type color, but dialogue flags should be grey
              const flagType = flag?.type || 'dialogue';
              const colorClass = flagType === 'dialogue' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                flagType === 'quest' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                flagType === 'achievement' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                flagType === 'item' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                flagType === 'stat' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                flagType === 'title' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                flagType === 'global' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                'bg-gray-500/20 text-gray-400 border-gray-500/30';
              return (
                <span key={flagId} className={`text-[8px] px-1 py-0.5 rounded border ${colorClass}`} title={flag?.name || flagId}>
                  {flagType === 'dialogue' ? 't' : flagType[0]}
                </span>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Output handle at bottom (for nextNodeId connection) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="next"
        className="!bg-[#2a2a3e] !border-[#4a4a6a] !w-4 !h-4 !rounded-full hover:!border-[#e94560] hover:!bg-[#e94560]/20"
      />
    </div>
  );
}

