/**
 * NPCNodeV2 - React Flow node component for NPC dialogue
 *
 * Displays:
 * - Node header with ID and type
 * - Speaker name (if present)
 * - Content preview (truncated)
 * - Flag indicators
 * - Start/End badges when applicable
 */
import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Play, Flag, Hash } from 'lucide-react';
// ============================================================================
// Styles
// ============================================================================
const FLAG_COLORS = {
    dialogue: 'bg-df-flag-dialogue-bg text-df-flag-dialogue border-df-flag-dialogue',
    quest: 'bg-df-flag-quest-bg text-df-flag-quest border-df-flag-quest',
    achievement: 'bg-df-flag-achievement-bg text-df-flag-achievement border-df-flag-achievement',
    item: 'bg-df-flag-item-bg text-df-flag-item border-df-flag-item',
    stat: 'bg-df-flag-stat-bg text-df-flag-stat border-df-flag-stat',
    title: 'bg-df-flag-title-bg text-df-flag-title border-df-flag-title',
    global: 'bg-df-flag-global-bg text-df-flag-global border-df-flag-global',
};
function getFlagColorClass(type) {
    return FLAG_COLORS[type] || FLAG_COLORS.dialogue;
}
// ============================================================================
// Component
// ============================================================================
export function NPCNodeV2({ data, selected }) {
    const { node, flagSchema, characters = {}, isDimmed, isInPath, layoutDirection = 'TB', isStartNode, isEndNode } = data;
    // Get character if characterId is set
    const character = node.characterId ? characters[node.characterId] : undefined;
    const displayName = character ? character.name : (node.speaker || 'NPC');
    const avatar = character?.avatar || '👤';
    // Handle positions based on layout direction
    const isHorizontal = layoutDirection === 'LR';
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    // Border color based on state
    const borderClass = selected
        ? 'border-df-npc-selected shadow-lg shadow-df-glow'
        : isStartNode
            ? 'border-df-start shadow-md'
            : isEndNode
                ? 'border-df-end shadow-md'
                : 'border-df-npc-border';
    // Header background based on node type
    const headerBgClass = isStartNode
        ? 'bg-df-start-bg'
        : isEndNode
            ? 'bg-df-end-bg'
            : 'bg-df-npc-header';
    // Content preview (truncated)
    const contentPreview = node.content.length > 60
        ? node.content.slice(0, 60) + '...'
        : node.content;
    return (React.createElement("div", { className: `rounded-lg border-2 transition-all duration-300 ${borderClass} ${isInPath ? 'border-df-node-selected/70' : ''} bg-df-npc-bg min-w-[320px] max-w-[450px] relative overflow-hidden`, style: isDimmed ? { opacity: 0.35, filter: 'saturate(0.3)' } : undefined },
        React.createElement(Handle, { type: "target", position: targetPosition, className: "!bg-df-control-bg !border-df-control-border !w-4 !h-4 !rounded-full" }),
        React.createElement("div", { className: `${headerBgClass} border-b-2 border-df-npc-border px-3 py-2.5 flex items-center gap-3 relative` },
            React.createElement("div", { className: "w-14 h-14 rounded-full bg-df-npc-bg border-[3px] border-df-npc-border flex items-center justify-center text-3xl shadow-lg flex-shrink-0" }, avatar),
            React.createElement("div", { className: "flex-1 min-w-0" },
                React.createElement("h3", { className: "text-base font-bold text-df-text-primary truncate leading-tight" }, displayName)),
            React.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" },
                React.createElement("div", { className: "flex items-center gap-1 px-2 py-1 rounded bg-df-base/50 border border-df-control-border", title: `Node ID: ${node.id}` },
                    React.createElement(Hash, { size: 12, className: "text-df-text-secondary" }),
                    React.createElement("span", { className: "text-[10px] font-mono text-df-text-secondary" }, node.id)),
                React.createElement("div", { className: "flex items-center gap-1 px-2 py-1 rounded bg-df-npc-selected/20 border border-df-npc-selected/50", title: "NPC Node" },
                    React.createElement(MessageSquare, { size: 14, className: "text-df-npc-selected" }),
                    React.createElement("span", { className: "text-[10px] font-semibold text-df-npc-selected" }, "NPC"))),
            isStartNode && (React.createElement("div", { className: "absolute top-1 right-1 bg-df-start text-df-text-primary text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-20" },
                React.createElement(Play, { size: 8, fill: "currentColor" }),
                " START")),
            isEndNode && (React.createElement("div", { className: "absolute top-1 right-1 bg-df-end text-df-text-primary text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-20" },
                React.createElement(Flag, { size: 8 }),
                " END"))),
        React.createElement("div", { className: "px-4 py-3" },
            React.createElement("div", { className: "bg-df-elevated border border-df-control-border rounded-lg px-4 py-3 mb-2" },
                React.createElement("p", { className: "text-sm text-df-text-primary leading-relaxed" },
                    "\"",
                    contentPreview,
                    "\"")),
            node.setFlags && node.setFlags.length > 0 && (React.createElement("div", { className: "flex flex-wrap gap-1" }, node.setFlags.map((flagId) => {
                const flag = flagSchema?.flags.find((f) => f.id === flagId);
                const flagType = flag?.type || 'dialogue';
                return (React.createElement("span", { key: flagId, className: `text-[8px] px-1.5 py-0.5 rounded-full border ${getFlagColorClass(flagType)}`, title: flag?.name || flagId }, flagType === 'dialogue' ? 't' : flagType[0]));
            })))),
        React.createElement(Handle, { type: "source", position: sourcePosition, id: "next", className: "!bg-df-control-bg !border-df-control-border !w-4 !h-4 !rounded-full hover:!border-df-npc-selected hover:!bg-df-npc-selected/20" })));
}
