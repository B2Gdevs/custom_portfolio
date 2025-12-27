"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerNodeV2 = PlayerNodeV2;
const react_1 = __importStar(require("react"));
const reactflow_1 = require("reactflow");
const lucide_react_1 = require("lucide-react");
// Color scheme for choice edges (same as current implementation)
const CHOICE_COLORS = ['#e94560', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'];
function PlayerNodeV2({ data, selected }) {
    const { node, flagSchema, characters = {}, isDimmed, isInPath, layoutDirection = 'TB', isStartNode, isEndNode } = data;
    const choices = node.choices || [];
    // Get character if characterId is set
    const character = node.characterId ? characters[node.characterId] : undefined;
    const displayName = character ? character.name : (node.speaker || 'Player');
    const avatar = character?.avatar || '🎮';
    const updateNodeInternals = (0, reactflow_1.useUpdateNodeInternals)();
    const headerRef = (0, react_1.useRef)(null);
    const choiceRefs = (0, react_1.useRef)([]);
    const [handlePositions, setHandlePositions] = (0, react_1.useState)([]);
    // Handle positions based on layout direction
    const isHorizontal = layoutDirection === 'LR';
    const targetPosition = isHorizontal ? reactflow_1.Position.Left : reactflow_1.Position.Top;
    const sourcePosition = isHorizontal ? reactflow_1.Position.Right : reactflow_1.Position.Bottom;
    // Calculate handle positions based on actual rendered heights
    (0, react_1.useEffect)(() => {
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
    (0, react_1.useEffect)(() => {
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
    return (react_1.default.createElement("div", { className: `rounded-lg border-2 transition-all duration-300 ${borderClass} ${isInPath ? 'border-df-player-selected/70' : ''} bg-df-player-bg min-w-[320px] max-w-[450px] relative overflow-hidden`, style: isDimmed ? { opacity: 0.35, filter: 'saturate(0.3)' } : undefined },
        react_1.default.createElement(reactflow_1.Handle, { type: "target", position: targetPosition, className: "!bg-df-control-bg !border-df-control-border !w-4 !h-4 !rounded-full" }),
        react_1.default.createElement("div", { ref: headerRef, className: `${headerBgClass} border-b-2 border-df-player-border px-3 py-2.5 flex items-center gap-3 relative` },
            react_1.default.createElement("div", { className: "w-14 h-14 rounded-full bg-df-player-bg border-[3px] border-df-player-border flex items-center justify-center text-3xl shadow-lg flex-shrink-0" }, avatar),
            react_1.default.createElement("div", { className: "flex-1 min-w-0" },
                react_1.default.createElement("h3", { className: "text-base font-bold text-df-text-primary truncate leading-tight" }, displayName)),
            react_1.default.createElement("div", { className: "flex items-center gap-2 flex-shrink-0" },
                react_1.default.createElement("div", { className: "flex items-center gap-1 px-2 py-1 rounded bg-df-base/50 border border-df-control-border", title: `Node ID: ${node.id}` },
                    react_1.default.createElement(lucide_react_1.Hash, { size: 12, className: "text-df-text-secondary" }),
                    react_1.default.createElement("span", { className: "text-[10px] font-mono text-df-text-secondary" }, node.id)),
                react_1.default.createElement("div", { className: "flex items-center gap-1 px-2 py-1 rounded bg-df-player-selected/20 border border-df-player-selected/50", title: "Player Node" },
                    react_1.default.createElement(lucide_react_1.GitBranch, { size: 14, className: "text-df-player-selected" }),
                    react_1.default.createElement("span", { className: "text-[10px] font-semibold text-df-player-selected" }, "PLAYER"))),
            isStartNode && (react_1.default.createElement("div", { className: "absolute top-1 right-1 bg-df-start text-df-text-primary text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-20" },
                react_1.default.createElement(lucide_react_1.Play, { size: 8, fill: "currentColor" }),
                " START")),
            isEndNode && (react_1.default.createElement("div", { className: "absolute top-1 right-1 bg-df-end text-df-text-primary text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-lg z-20" },
                react_1.default.createElement(lucide_react_1.Flag, { size: 8 }),
                " END"))),
        react_1.default.createElement("div", { className: "px-4 py-3 space-y-2" }, choices.map((choice, idx) => {
            // Use calculated position or fallback
            const choiceColor = CHOICE_COLORS[idx % CHOICE_COLORS.length];
            return (react_1.default.createElement("div", { key: choice.id, ref: el => {
                    choiceRefs.current[idx] = el;
                }, className: "relative group" },
                react_1.default.createElement("div", { className: "bg-df-elevated border border-df-control-border rounded-lg px-3 py-2 flex items-start gap-2 hover:border-df-player-selected/50 transition-colors" },
                    react_1.default.createElement("div", { className: "flex-1 min-w-0" },
                        react_1.default.createElement("p", { className: "text-sm text-df-text-primary leading-relaxed" },
                            "\"",
                            choice.text || 'Empty choice',
                            "\""),
                        choice.setFlags && choice.setFlags.length > 0 && (react_1.default.createElement("div", { className: "mt-1.5 flex flex-wrap gap-1" }, choice.setFlags.map(flagId => {
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
                            return (react_1.default.createElement("span", { key: flagId, className: `text-[8px] px-1 py-0.5 rounded-full border ${colorClass}`, title: flag?.name || flagId }, flagType === 'dialogue' ? 't' : flagType[0]));
                        })))),
                    react_1.default.createElement(reactflow_1.Handle, { type: "source", position: reactflow_1.Position.Right, id: `choice-${idx}`, style: {
                            top: `50%`,
                            transform: `translateY(-50%)`,
                            right: '-6px',
                            borderColor: choiceColor,
                        }, className: "!bg-df-control-bg !border-2 hover:!border-df-player-selected hover:!bg-df-player-selected/20 !w-3 !h-3 !rounded-full" }))));
        })),
        react_1.default.createElement(reactflow_1.Handle, { type: "source", position: sourcePosition, id: "next", className: "!bg-df-control-bg !border-df-control-border !w-4 !h-4 !rounded-full hover:!border-df-player-selected hover:!bg-df-player-selected/20" })));
}
