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
exports.DialogueSimulator = DialogueSimulator;
const react_1 = __importStar(require("react"));
const flag_manager_1 = require("../lib/flag-manager");
function DialogueSimulator({ dialogue, initialFlags, startNodeId, onComplete, onFlagUpdate }) {
    const [currentNodeId, setCurrentNodeId] = (0, react_1.useState)(startNodeId || dialogue.startNodeId);
    const [flags, setFlags] = (0, react_1.useState)(initialFlags);
    const [history, setHistory] = (0, react_1.useState)([]);
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const [visitedNodes, setVisitedNodes] = (0, react_1.useState)(new Set());
    const chatEndRef = (0, react_1.useRef)(null);
    // Process current node
    (0, react_1.useEffect)(() => {
        const node = dialogue.nodes[currentNodeId];
        if (!node || node.type !== 'npc')
            return;
        setIsTyping(true);
        const timer = setTimeout(() => {
            // Mark as visited
            setVisitedNodes(prev => new Set([...prev, node.id]));
            // Update flags
            if (node.setFlags && node.setFlags.length > 0) {
                const updated = (0, flag_manager_1.mergeFlagUpdates)(flags, node.setFlags);
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
                setTimeout(() => setCurrentNodeId(node.nextNodeId), 300);
            }
            else {
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
    (0, react_1.useEffect)(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isTyping]);
    const currentNode = dialogue.nodes[currentNodeId];
    // Filter choices based on conditions and flags
    const availableChoices = currentNode?.choices?.filter(choice => {
        if (!choice.conditions)
            return true;
        return choice.conditions.every(cond => {
            const flagValue = flags[cond.flag];
            const hasFlag = flagValue !== undefined && flagValue !== false && flagValue !== 0 && flagValue !== '';
            return cond.operator === 'is_set' ? hasFlag : !hasFlag;
        });
    }) || [];
    const handleChoice = (choice) => {
        // Add to history
        setHistory(prev => [...prev, {
                nodeId: choice.id,
                type: 'player',
                content: choice.text
            }]);
        // Update flags
        if (choice.setFlags && choice.setFlags.length > 0) {
            const updated = (0, flag_manager_1.mergeFlagUpdates)(flags, choice.setFlags);
            setFlags(updated);
            onFlagUpdate?.(updated);
        }
        // Move to next node
        if (choice.nextNodeId) {
            setCurrentNodeId(choice.nextNodeId);
        }
        else {
            // Choice leads nowhere - dialogue complete
            onComplete({
                updatedFlags: flags,
                dialogueTree: dialogue,
                completedNodeIds: Array.from(visitedNodes)
            });
        }
    };
    return (react_1.default.createElement("div", { className: "flex-1 flex flex-col" },
        react_1.default.createElement("div", { className: "flex-1 overflow-y-auto p-4" },
            react_1.default.createElement("div", { className: "max-w-2xl mx-auto space-y-4" },
                history.map((entry, idx) => (react_1.default.createElement("div", { key: idx, className: `flex ${entry.type === 'player' ? 'justify-end' : 'justify-start'}` },
                    react_1.default.createElement("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 ${entry.type === 'player'
                            ? 'bg-[#e94560] text-white rounded-br-md'
                            : 'bg-[#1a1a2e] text-gray-100 rounded-bl-md'}` },
                        entry.type === 'npc' && entry.speaker && (react_1.default.createElement("div", { className: "text-xs text-[#e94560] font-medium mb-1" }, entry.speaker)),
                        react_1.default.createElement("div", { className: "whitespace-pre-wrap" }, entry.content))))),
                isTyping && (react_1.default.createElement("div", { className: "flex justify-start" },
                    react_1.default.createElement("div", { className: "bg-[#1a1a2e] rounded-2xl rounded-bl-md px-4 py-3" },
                        react_1.default.createElement("div", { className: "flex gap-1" },
                            react_1.default.createElement("span", { className: "w-2 h-2 bg-[#e94560] rounded-full animate-bounce", style: { animationDelay: '0ms' } }),
                            react_1.default.createElement("span", { className: "w-2 h-2 bg-[#e94560] rounded-full animate-bounce", style: { animationDelay: '150ms' } }),
                            react_1.default.createElement("span", { className: "w-2 h-2 bg-[#e94560] rounded-full animate-bounce", style: { animationDelay: '300ms' } }))))),
                react_1.default.createElement("div", { ref: chatEndRef }))),
        currentNode?.type === 'player' && !isTyping && availableChoices.length > 0 && (react_1.default.createElement("div", { className: "border-t border-[#1a1a2e] bg-[#0d0d14]/80 backdrop-blur-sm p-4" },
            react_1.default.createElement("div", { className: "max-w-2xl mx-auto space-y-2" }, availableChoices.map((choice) => (react_1.default.createElement("button", { key: choice.id, onClick: () => handleChoice(choice), className: "w-full text-left px-4 py-3 rounded-lg border border-[#2a2a3e] hover:border-[#e94560] bg-[#12121a] hover:bg-[#1a1a2e] text-gray-200 transition-all group flex items-center justify-between" },
                react_1.default.createElement("span", null, choice.text),
                react_1.default.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "text-gray-600 group-hover:text-[#e94560] transition-colors" },
                    react_1.default.createElement("polyline", { points: "9 18 15 12 9 6" })))))))),
        currentNode?.type === 'npc' && !currentNode.nextNodeId && !isTyping && (react_1.default.createElement("div", { className: "border-t border-[#1a1a2e] bg-[#0d0d14]/80 backdrop-blur-sm p-4" },
            react_1.default.createElement("div", { className: "max-w-2xl mx-auto text-center" },
                react_1.default.createElement("p", { className: "text-gray-500 mb-3" }, "Dialogue complete"),
                react_1.default.createElement("button", { onClick: () => onComplete({
                        updatedFlags: flags,
                        dialogueTree: dialogue,
                        completedNodeIds: Array.from(visitedNodes)
                    }), className: "px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded-lg transition-colors" }, "Close"))))));
}
