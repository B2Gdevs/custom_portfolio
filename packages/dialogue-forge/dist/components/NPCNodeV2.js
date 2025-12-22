"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPCNodeV2 = NPCNodeV2;
const react_1 = __importDefault(require("react"));
const reactflow_1 = require("reactflow");
const lucide_react_1 = require("lucide-react");
// ============================================================================
// Styles
// ============================================================================
const FLAG_COLORS = {
    dialogue: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    quest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    achievement: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    item: 'bg-green-500/20 text-green-400 border-green-500/30',
    stat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    title: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    global: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};
function getFlagColorClass(type) {
    return FLAG_COLORS[type] || FLAG_COLORS.dialogue;
}
// ============================================================================
// Component
// ============================================================================
function NPCNodeV2({ data, selected }) {
    const { node, flagSchema, isDimmed, isInPath, layoutDirection = 'TB', isStartNode, isEndNode } = data;
    // Handle positions based on layout direction
    const isHorizontal = layoutDirection === 'LR';
    const targetPosition = isHorizontal ? reactflow_1.Position.Left : reactflow_1.Position.Top;
    const sourcePosition = isHorizontal ? reactflow_1.Position.Right : reactflow_1.Position.Bottom;
    // Border color based on state
    const borderClass = selected
        ? 'border-[#e94560] shadow-lg shadow-[#e94560]/20'
        : isStartNode
            ? 'border-green-500 shadow-md shadow-green-500/20'
            : isEndNode
                ? 'border-amber-500 shadow-md shadow-amber-500/20'
                : 'border-[#4a1a1a]';
    // Header background based on node type
    const headerBgClass = isStartNode
        ? 'bg-green-500/10'
        : isEndNode
            ? 'bg-amber-500/10'
            : 'bg-[#12121a]';
    // Content preview (truncated)
    const contentPreview = node.content.length > 60
        ? node.content.slice(0, 60) + '...'
        : node.content;
    return (react_1.default.createElement("div", { className: `rounded-lg border-2 transition-all duration-300 ${borderClass} ${isInPath ? 'border-[#e94560]/70' : ''} bg-[#1a1a2e] min-w-[200px] relative`, style: isDimmed ? { opacity: 0.35, filter: 'saturate(0.3)' } : undefined },
        isStartNode && (react_1.default.createElement("div", { className: "absolute -top-2 -left-2 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg z-10" },
            react_1.default.createElement(lucide_react_1.Play, { size: 8, fill: "currentColor" }),
            " START")),
        isEndNode && (react_1.default.createElement("div", { className: "absolute -top-2 -right-2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg z-10" },
            react_1.default.createElement(lucide_react_1.Flag, { size: 8 }),
            " END")),
        react_1.default.createElement(reactflow_1.Handle, { type: "target", position: targetPosition, className: "!bg-[#2a2a3e] !border-[#4a4a6a] !w-4 !h-4 !rounded-full" }),
        react_1.default.createElement("div", { className: `px-3 py-1.5 border-b border-[#2a2a3e] flex items-center gap-2 rounded-t-lg ${headerBgClass}` },
            react_1.default.createElement(lucide_react_1.MessageSquare, { size: 12, className: "text-[#e94560]" }),
            react_1.default.createElement("span", { className: "text-[10px] font-mono text-gray-500 truncate flex-1" }, node.id),
            react_1.default.createElement("span", { className: "text-[10px] text-gray-600" }, "NPC")),
        react_1.default.createElement("div", { className: "px-3 py-2 min-h-[50px]" },
            node.speaker && (react_1.default.createElement("div", { className: "text-[10px] text-[#e94560] font-medium mb-1" }, node.speaker)),
            react_1.default.createElement("div", { className: "text-xs text-gray-300 line-clamp-2 bg-[#0d0d14] border border-[#2a2a3e] rounded px-2 py-1" },
                "\"",
                contentPreview,
                "\""),
            node.setFlags && node.setFlags.length > 0 && (react_1.default.createElement("div", { className: "mt-1.5 flex flex-wrap gap-1" }, node.setFlags.map(flagId => {
                const flag = flagSchema?.flags.find(f => f.id === flagId);
                const flagType = flag?.type || 'dialogue';
                return (react_1.default.createElement("span", { key: flagId, className: `text-[8px] px-1 py-0.5 rounded border ${getFlagColorClass(flagType)}`, title: flag?.name || flagId }, flagType === 'dialogue' ? 't' : flagType[0]));
            })))),
        react_1.default.createElement(reactflow_1.Handle, { type: "source", position: sourcePosition, id: "next", className: "!bg-[#2a2a3e] !border-[#4a4a6a] !w-4 !h-4 !rounded-full hover:!border-[#e94560] hover:!bg-[#e94560]/20" })));
}
