import React, { useEffect, useRef, useState } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { GitBranch, Play, Flag, Hash } from 'lucide-react';
// Color scheme for choice edges (same as current implementation)
const CHOICE_COLORS = ['#e94560', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];
export function PlayerNodeV2({ data, selected }) {
    const { node, flagSchema, characters = {}, isDimmed, isInPath, layoutDirection = 'TB', isStartNode, isEndNode } = data;
    const choices = node.choices || [];
    // Get character if characterId is set
    const character = node.characterId ? characters[node.characterId] : undefined;
    const displayName = character ? character.name : (node.speaker || 'Player');
    const avatar = character?.avatar || '🎮';
    const updateNodeInternals = useUpdateNodeInternals();
    const headerRef = useRef(null);
    const choiceRefs = useRef([]);
    const [handlePositions, setHandlePositions] = useState([]);
    // Handle positions based on layout direction
    const isHorizontal = layoutDirection === 'LR';
    const targetPosition = isHorizontal ? Position.Left : Position.Top;
    const sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    // Calculate handle positions based on actual rendered heights
    useEffect(() => {
        if (headerRef.current && choices.length > 0) {
            const positions = [];
            const headerHeight = headerRef.current.offsetHeight;
            let cumulativeHeight = headerHeight;
            choices.forEach((_choice, idx) => {
                const choiceEl = choiceRefs.current[idx];
                if (choiceEl) {
                    const choiceHeight = choiceEl.offsetHeight;
                    const handleY = cumulativeHeight + (choiceHeight / 2);
                    positions.push(handleY);
                    cumulativeHeight += choiceHeight;
                }
                else {
                    // Fallback: estimate height
                    const estimatedHeight = 32; // py-1.5 (12px) + text (~16px) + flags (~4px) = ~32px
                    const handleY = cumulativeHeight + (estimatedHeight / 2);
                    positions.push(handleY);
                    cumulativeHeight += estimatedHeight;
                }
            });
            setHandlePositions(positions);
            // Update React Flow internals after positions are calculated
            setTimeout(() => {
                updateNodeInternals(node.id);
            }, 0);
        }
    }, [choices, node.id, updateNodeInternals]);
    // Update node internals when choices change
    useEffect(() => {
        updateNodeInternals(node.id);
    }, [choices.length, node.id, updateNodeInternals]);
    // Check if this is an end node (player node with no choices that have nextNodeId)
    const hasNoOutgoingConnections = !choices.some(c => c.nextNodeId);
    // Border color based on state
    const borderClass = selected
        ? 'border-df-player-selected shadow-lg shadow-df-glow'
        : isStartNode
            ? 'border-df-start shadow-md'
            : isEndNode
                ? 'border-df-end shadow-md'
                : 'border-df-player-border';
    // Header background for player nodes
    const headerBgClass = isStartNode
        ? 'bg-df-start-bg'
        : isEndNode
            ? 'bg-df-end-bg'
            : 'bg-df-player-header';
    return (React.createElement("div", { className: `rounded-lg border-2 transition-all duration-300 ${borderClass} ${isInPath ? 'border-df-player-selected/70' : ''} bg-df-player-bg min-w-[320px] max-w-[450px] relative overflow-hidden`, style: isDimmed ? { opacity: 0.35, filter: 'saturate(0.3)' } : undefined },
        React.createElement(Handle, { type: "target", position: targetPosition, className: "!bg-df-control-bg !border-df-control-border !w-4 !h-4 !rounded-full" }),
        React.createElement("div", { ref: headerRef, className: `${headerBgClass} border-b-2 border-df-player-border px-3 py-2.5 flex items-center gap-3 relative` },
            React.createElement("div", { className: "w-14 h-14 rounded-full bg-df-player-bg border-[3px] border-df-player-border flex items-center justify-center text-3xl shadow-lg flex-shrink-0" }, avatar),
            React.createElement("div", { className: "flex-1 min-w-0" },
                React.createElement("h3", { className: "text-base font-bold text-df-text-primary truncate leading-tight" }, displayName)),
            React.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" },
                React.createElement("div", { className: "flex items-center gap-1 px-2 py-1 rounded bg-df-base/50 border border-df-control-border", title: `Node ID: ${node.id}` },
                    React.createElement(Hash, { size: 12, className: "text-df-text-secondary" }),
                    React.createElement("span", { className: "text-[10px] font-mono text-df-text-secondary" }, node.id)),
                React.createElement("div", { className: "flex items-center gap-1 px-2 py-1 rounded bg-df-player-selected/20 border border-df-player-selected/50", title: "Player Node" },
                    React.createElement(GitBranch, { size: 14, className: "text-df-player-selected" }),
                    React.createElement("span", { className: "text-[10px] font-semibold text-df-player-selected" }, "PLAYER"))),
            isStartNode && (React.createElement("div", { className: "absolute top-1 right-1 bg-df-start text-df-text-primary text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-20" },
                React.createElement(Play, { size: 8, fill: "currentColor" }),
                " START")),
            isEndNode && (React.createElement("div", { className: "absolute top-1 right-1 bg-df-end text-df-text-primary text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-20" },
                React.createElement(Flag, { size: 8 }),
                " END"))),
        React.createElement("div", { className: "px-4 py-3 space-y-2" }, choices.map((choice, idx) => {
            // Use calculated position or fallback
            const choiceColor = CHOICE_COLORS[idx % CHOICE_COLORS.length];
            return (React.createElement("div", { key: choice.id, ref: el => {
                    choiceRefs.current[idx] = el;
                }, className: "relative group" },
                React.createElement("div", { className: "bg-df-elevated border border-df-control-border rounded-lg px-3 py-2 flex items-start gap-2 hover:border-df-player-selected/50 transition-colors" },
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("p", { className: "text-sm text-df-text-primary leading-relaxed" },
                            "\"",
                            choice.text || 'Empty choice',
                            "\""),
                        choice.setFlags && choice.setFlags.length > 0 && (React.createElement("div", { className: "mt-1.5 flex flex-wrap gap-1" }, choice.setFlags.map(flagId => {
                            const flag = flagSchema?.flags.find(f => f.id === flagId);
                            const flagType = flag?.type || 'dialogue';
                            const colorClass = flagType === 'dialogue' ? 'bg-df-flag-dialogue-bg text-df-flag-dialogue border-df-flag-dialogue' :
                                flagType === 'quest' ? 'bg-df-flag-quest-bg text-df-flag-quest border-df-flag-quest' :
                                    flagType === 'achievement' ? 'bg-df-flag-achievement-bg text-df-flag-achievement border-df-flag-achievement' :
                                        flagType === 'item' ? 'bg-df-flag-item-bg text-df-flag-item border-df-flag-item' :
                                            flagType === 'stat' ? 'bg-df-flag-stat-bg text-df-flag-stat border-df-flag-stat' :
                                                flagType === 'title' ? 'bg-df-flag-title-bg text-df-flag-title border-df-flag-title' :
                                                    flagType === 'global' ? 'bg-df-flag-global-bg text-df-flag-global border-df-flag-global' :
                                                        'bg-df-flag-dialogue-bg text-df-flag-dialogue border-df-flag-dialogue';
                            return (React.createElement("span", { key: flagId, className: `text-[8px] px-1 py-0.5 rounded-full border ${colorClass}`, title: flag?.name || flagId }, flagType === 'dialogue' ? 't' : flagType[0]));
                        })))),
                    React.createElement(Handle, { type: "source", position: Position.Right, id: `choice-${idx}`, style: {
                            top: `50%`,
                            transform: `translateY(-50%)`,
                            right: '-6px',
                            borderColor: choiceColor,
                        }, className: "!bg-df-control-bg !border-2 hover:!border-df-player-selected hover:!bg-df-player-selected/20 !w-3 !h-3 !rounded-full" }))));
        })),
        React.createElement(Handle, { type: "source", position: sourcePosition, id: "next", className: "!bg-df-control-bg !border-df-control-border !w-4 !h-4 !rounded-full hover:!border-df-player-selected hover:!bg-df-player-selected/20" })));
}
