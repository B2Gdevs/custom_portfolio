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
    const { node, flagSchema, isDimmed, isInPath, layoutDirection = 'TB', isStartNode, isEndNode } = data;
    const choices = node.choices || [];
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
            choices.forEach((_, idx) => {
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
    return (react_1.default.createElement("div", { className: `rounded-lg border-2 transition-all duration-300 ${selected ? 'border-[#8b5cf6] shadow-lg shadow-[#8b5cf6]/20' :
            isStartNode ? 'border-green-500 shadow-md shadow-green-500/20' :
                isEndNode ? 'border-amber-500 shadow-md shadow-amber-500/20' :
                    'border-[#2a1a3a]'} ${isInPath ? 'border-[#8b5cf6]/70' : ''} bg-[#1e1e3a] min-w-[200px] relative`, style: isDimmed ? { opacity: 0.35, filter: 'saturate(0.3)' } : undefined },
        isStartNode && (react_1.default.createElement("div", { className: "absolute -top-2 -left-2 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg z-10" },
            react_1.default.createElement(lucide_react_1.Play, { size: 8, fill: "currentColor" }),
            " START")),
        isEndNode && (react_1.default.createElement("div", { className: "absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg z-10" },
            react_1.default.createElement(lucide_react_1.Flag, { size: 8 }),
            " END")),
        react_1.default.createElement(reactflow_1.Handle, { type: "target", position: targetPosition, className: "!bg-[#2a2a3e] !border-[#4a4a6a] !w-4 !h-4 !rounded-full" }),
        react_1.default.createElement("div", { ref: headerRef, className: "px-3 py-1.5 border-b border-[#2a2a3e] bg-[#16162a] flex items-center gap-2 rounded-t-lg" },
            react_1.default.createElement(lucide_react_1.GitBranch, { size: 12, className: "text-purple-400" }),
            react_1.default.createElement("span", { className: "text-[10px] font-mono text-gray-500 truncate flex-1" }, node.id),
            react_1.default.createElement("span", { className: "text-[10px] text-gray-600" }, "PLAYER")),
        react_1.default.createElement("div", { className: "border-t border-[#2a2a3e]" }, choices.map((choice, idx) => {
            // Use calculated position or fallback
            return (react_1.default.createElement("div", { key: choice.id, ref: el => {
                    choiceRefs.current[idx] = el;
                }, className: "px-3 py-1.5 text-[10px] text-gray-400 flex items-center gap-2 border-b border-[#2a2a3e] last:border-0 relative" },
                react_1.default.createElement("div", { className: "flex-1 min-w-0" },
                    react_1.default.createElement("span", { className: "truncate block bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1 text-gray-300" },
                        "\"",
                        choice.text || 'Empty choice',
                        "\""),
                    choice.setFlags && choice.setFlags.length > 0 && (react_1.default.createElement("div", { className: "mt-0.5 flex flex-wrap gap-0.5" }, choice.setFlags.map(flagId => {
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
                        return (react_1.default.createElement("span", { key: flagId, className: `text-[7px] px-0.5 py-0 rounded border ${colorClass}`, title: flag?.name || flagId }, flagType === 'dialogue' ? 't' : flagType[0]));
                    })))),
                react_1.default.createElement(reactflow_1.Handle, { type: "source", position: reactflow_1.Position.Right, id: `choice-${idx}`, style: {
                        top: `50%`,
                        transform: `translateY(-50%)`,
                        right: '-6px',
                    }, className: "!bg-[#2a2a3e] !border-2 hover:!border-[#e94560] hover:!bg-[#e94560]/20 !w-3 !h-3 !rounded-full" })));
        }))));
}
