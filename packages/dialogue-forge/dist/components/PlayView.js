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
exports.PlayView = PlayView;
const react_1 = __importStar(require("react"));
const flag_manager_1 = require("../lib/flag-manager");
const ScenePlayer_1 = require("./ScenePlayer");
function PlayView({ dialogue, startNodeId, flagSchema, initialFlags }) {
    // Initialize game flags with defaults from schema, then merge with initialFlags
    const initialGameFlags = (0, react_1.useMemo)(() => {
        if (flagSchema) {
            const defaults = (0, flag_manager_1.initializeFlags)(flagSchema);
            return { ...defaults, ...initialFlags };
        }
        return initialFlags || {};
    }, [flagSchema, initialFlags]);
    // Convert flags to gameState format for ScenePlayer
    const gameState = (0, react_1.useMemo)(() => {
        return { flags: initialGameFlags };
    }, [initialGameFlags]);
    const [currentFlags, setCurrentFlags] = (0, react_1.useState)(initialGameFlags);
    const [showDebugPanel, setShowDebugPanel] = (0, react_1.useState)(false);
    const [flagsSetDuringRun, setFlagsSetDuringRun] = (0, react_1.useState)(new Set());
    // Track initial flags to detect changes
    const initialFlagsRef = (0, react_1.useRef)(initialGameFlags);
    const handleComplete = (result) => {
        // Update flags from result
        if (result.updatedFlags) {
            setCurrentFlags(result.updatedFlags);
        }
    };
    const handleFlagUpdate = (flags) => {
        setCurrentFlags(flags);
        // Track which flags were set during this run
        if (flagSchema) {
            setFlagsSetDuringRun(prev => {
                const next = new Set(prev);
                Object.keys(flags).forEach(flagId => {
                    const initialValue = initialFlagsRef.current[flagId];
                    const currentValue = flags[flagId];
                    if (initialValue !== currentValue) {
                        next.add(flagId);
                    }
                });
                return next;
            });
        }
    };
    // Update gameState when flags change (for ScenePlayer)
    const currentGameState = (0, react_1.useMemo)(() => {
        return { flags: currentFlags };
    }, [currentFlags]);
    // Get all non-dialogue flags from schema
    const gameFlagsList = (0, react_1.useMemo)(() => {
        if (!flagSchema)
            return [];
        return flagSchema.flags.filter(f => f.type !== 'dialogue');
    }, [flagSchema]);
    const flagTypeColors = {
        dialogue: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        quest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        achievement: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        item: 'bg-green-500/20 text-green-400 border-green-500/30',
        stat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        title: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        global: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return (react_1.default.createElement("main", { className: "flex-1 flex flex-col relative" },
        flagSchema && (react_1.default.createElement("button", { onClick: () => setShowDebugPanel(!showDebugPanel), className: "absolute top-4 right-4 z-10 px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#2a2a3e] border border-[#2a2a3e] hover:border-[#e94560] text-gray-400 hover:text-white text-xs rounded-lg transition-colors flex items-center gap-2", title: "Toggle Flag Debug Panel" },
            react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                react_1.default.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                react_1.default.createElement("path", { d: "M9 9h6M9 15h6M9 12h6" })),
            showDebugPanel ? 'Hide' : 'Debug',
            " Flags")),
        showDebugPanel && flagSchema && (react_1.default.createElement("div", { className: "absolute top-12 right-4 w-80 bg-[#0d0d14] border border-[#1a1a2e] rounded-lg shadow-xl z-20 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col" },
            react_1.default.createElement("div", { className: "p-3 border-b border-[#1a1a2e] flex items-center justify-between" },
                react_1.default.createElement("h3", { className: "text-sm font-semibold text-white" }, "Flag Debug Panel"),
                react_1.default.createElement("button", { onClick: () => setShowDebugPanel(false), className: "p-1 text-gray-400 hover:text-white" },
                    react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        react_1.default.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                        react_1.default.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" })))),
            react_1.default.createElement("div", { className: "flex-1 overflow-y-auto p-3 space-y-4" },
                flagsSetDuringRun.size > 0 && (react_1.default.createElement("div", null,
                    react_1.default.createElement("h4", { className: "text-xs text-gray-500 uppercase mb-2" },
                        "Flags Set This Run (",
                        flagsSetDuringRun.size,
                        ")"),
                    react_1.default.createElement("div", { className: "space-y-1" }, Array.from(flagsSetDuringRun).map(flagId => {
                        const flag = flagSchema.flags.find(f => f.id === flagId);
                        if (!flag)
                            return null;
                        const value = currentFlags[flagId];
                        return (react_1.default.createElement("div", { key: flagId, className: "bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-xs" },
                            react_1.default.createElement("div", { className: "flex items-center gap-2" },
                                react_1.default.createElement("span", { className: `px-1.5 py-0.5 rounded text-[10px] border ${flagTypeColors[flag.type]}` }, flag.type),
                                react_1.default.createElement("span", { className: "font-mono text-white flex-1 truncate" }, flagId),
                                value !== undefined && (react_1.default.createElement("span", { className: "text-gray-400" },
                                    "= ",
                                    typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value))))));
                    })))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("h4", { className: "text-xs text-gray-500 uppercase mb-2" },
                        "All Game Flags (",
                        gameFlagsList.length,
                        ")"),
                    react_1.default.createElement("div", { className: "space-y-1 max-h-96 overflow-y-auto" }, gameFlagsList.map(flag => {
                        const value = currentFlags[flag.id];
                        const wasSet = flagsSetDuringRun.has(flag.id);
                        const hasValue = value !== undefined;
                        return (react_1.default.createElement("div", { key: flag.id, className: `bg-[#12121a] border rounded px-2 py-1.5 text-xs transition-colors ${wasSet ? 'border-[#e94560]/50 bg-[#e94560]/5' : 'border-[#2a2a3e]'}` },
                            react_1.default.createElement("div", { className: "flex items-center gap-2 mb-1" },
                                react_1.default.createElement("span", { className: `px-1.5 py-0.5 rounded text-[10px] border ${flagTypeColors[flag.type]}` }, flag.type),
                                react_1.default.createElement("span", { className: "font-mono text-white flex-1 truncate text-[10px]" }, flag.id),
                                wasSet && (react_1.default.createElement("span", { className: "text-[10px] px-1 py-0.5 bg-[#e94560]/20 text-[#e94560] rounded" }, "NEW"))),
                            react_1.default.createElement("div", { className: "text-gray-400 text-[10px] truncate" }, flag.name),
                            hasValue ? (react_1.default.createElement("div", { className: "mt-1 text-[10px] text-gray-300" },
                                react_1.default.createElement("span", { className: "text-gray-500" }, "Value: "),
                                react_1.default.createElement("span", { className: "font-mono" }, typeof value === 'boolean' ? (value ? 'true' : 'false') :
                                    typeof value === 'number' ? value :
                                        `"${value}"`))) : (react_1.default.createElement("div", { className: "mt-1 text-[10px] text-gray-600 italic" }, "Not set"))));
                    })))))),
        react_1.default.createElement(ScenePlayer_1.ScenePlayer, { dialogue: dialogue, gameState: currentGameState, startNodeId: startNodeId, onComplete: handleComplete, onFlagUpdate: handleFlagUpdate })));
}
