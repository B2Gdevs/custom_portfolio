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
exports.ScenePlayer = ScenePlayer;
const react_1 = __importStar(require("react"));
const flag_manager_1 = require("../lib/flag-manager");
const game_state_flattener_1 = require("../utils/game-state-flattener");
function ScenePlayer({ dialogue, gameState, startNodeId, onComplete, onFlagUpdate, flattenConfig, onNodeEnter, onNodeExit, onChoiceSelect, onDialogueStart, onDialogueEnd, }) {
    // Validate and extract flags from gameState
    const initialFlags = (0, react_1.useMemo)(() => {
        try {
            (0, game_state_flattener_1.validateGameState)(gameState);
            return (0, game_state_flattener_1.extractFlagsFromGameState)(gameState, flattenConfig);
        }
        catch (error) {
            console.error('ScenePlayer: Invalid gameState', error);
            throw error;
        }
    }, [gameState, flattenConfig]);
    const [currentNodeId, setCurrentNodeId] = (0, react_1.useState)(startNodeId || dialogue.startNodeId);
    const [flags, setFlags] = (0, react_1.useState)(initialFlags);
    const [history, setHistory] = (0, react_1.useState)([]);
    const [isTyping, setIsTyping] = (0, react_1.useState)(false);
    const [visitedNodes, setVisitedNodes] = (0, react_1.useState)(new Set());
    const chatEndRef = (0, react_1.useRef)(null);
    // Re-extract flags when gameState changes
    (0, react_1.useEffect)(() => {
        try {
            (0, game_state_flattener_1.validateGameState)(gameState);
            const newFlags = (0, game_state_flattener_1.extractFlagsFromGameState)(gameState, flattenConfig);
            setFlags(newFlags);
        }
        catch (error) {
            console.error('ScenePlayer: Failed to update flags from gameState', error);
        }
    }, [gameState, flattenConfig]);
    // Initialize dialogue
    (0, react_1.useEffect)(() => {
        if (currentNodeId === dialogue.startNodeId) {
            onDialogueStart?.();
        }
    }, []); // Only on mount
    // Process current node
    (0, react_1.useEffect)(() => {
        const node = dialogue.nodes[currentNodeId];
        if (!node)
            return;
        // Call onNodeEnter hook
        onNodeEnter?.(currentNodeId, node);
        if (node.type === 'npc') {
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
                // Call onNodeExit before moving to next
                onNodeExit?.(currentNodeId, node);
                // For NPC-only linear stories: don't auto-advance, wait for user input (Enter key or Continue button)
                // Only auto-advance if there's no next node (dialogue complete)
                if (!node.nextNodeId) {
                    // Dialogue complete
                    onDialogueEnd?.();
                    onComplete({
                        updatedFlags: flags,
                        dialogueTree: dialogue,
                        completedNodeIds: Array.from(visitedNodes)
                    });
                }
                // If there's a nextNodeId, we'll wait for user to press Enter or click Continue
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentNodeId, dialogue, flags, onNodeEnter, onNodeExit, onDialogueEnd, onComplete, onFlagUpdate]);
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
    // Handle Enter key for advancing NPC-only dialogues
    (0, react_1.useEffect)(() => {
        const handleKeyDown = (e) => {
            // Only handle Enter key when:
            // 1. Not typing
            // 2. Current node is NPC
            // 3. There's a next node to advance to
            // 4. Not waiting for player choice
            if (e.key === 'Enter' &&
                !isTyping &&
                currentNode?.type === 'npc' &&
                currentNode.nextNodeId &&
                availableChoices.length === 0) {
                e.preventDefault();
                setCurrentNodeId(currentNode.nextNodeId);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTyping, currentNode, availableChoices, setCurrentNodeId]);
    const handleChoice = (choice) => {
        const currentNode = dialogue.nodes[currentNodeId];
        // Call onChoiceSelect hook
        onChoiceSelect?.(currentNodeId, choice);
        // Call onNodeExit for current player node
        if (currentNode) {
            onNodeExit?.(currentNodeId, currentNode);
        }
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
    console.log("isnpc", currentNode?.type === 'npc');
    console.log("isplayer", currentNode?.type === 'player');
    console.log("isTyping", isTyping);
    console.log("availableChoices", availableChoices);
    console.log("visitedNodes", visitedNodes);
    console.log("flags", flags);
    console.log("history", history);
    console.log("currentNodeId", currentNodeId);
    console.log("dialogue", dialogue);
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
                    }), className: "px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded-lg transition-colors" }, "Close")))),
        currentNode?.type === 'npc' && currentNode.nextNodeId && !isTyping && (react_1.default.createElement("div", { className: "border-t border-[#1a1a2e] bg-[#0d0d14]/80 backdrop-blur-sm p-4 sticky bottom-0 z-10" },
            react_1.default.createElement("div", { className: "max-w-2xl mx-auto text-center" },
                react_1.default.createElement("p", { className: "text-xs text-gray-400 mb-3" },
                    "Press ",
                    react_1.default.createElement("kbd", { className: "px-2 py-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded text-xs" }, "Enter"),
                    " to continue"),
                react_1.default.createElement("button", { onClick: () => setCurrentNodeId(currentNode.nextNodeId), className: "px-6 py-3 bg-[#e94560] hover:bg-[#d63850] text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95", autoFocus: true }, "Continue \u2192"))))));
}
