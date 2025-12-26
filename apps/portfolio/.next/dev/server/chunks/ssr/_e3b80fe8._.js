module.exports = [
"[project]/apps/portfolio/app/dialogue-forge/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DialogueForgePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-ssr] (ecmascript) <export default as GitBranch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-ssr] (ecmascript) <export default as Code>");
(()=>{
    const e = new Error("Cannot find module '@magicborn/dialogue-forge/src/components/DialogueEditorV2'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@magicborn/dialogue-forge/src/components/GuidePanel'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@magicborn/dialogue-forge/src/components/FlagManager'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@magicborn/dialogue-forge/src/lib/yarn-converter'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@magicborn/dialogue-forge/src/utils/layout'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
(()=>{
    const e = new Error("Cannot find module '@magicborn/dialogue-forge/src/types/flags'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
;
;
;
;
;
;
;
;
const STORAGE_KEY = 'dialogue-forge-tree-v2';
const FLAG_SCHEMA_KEY = 'dialogue-forge-flag-schema';
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const defaultDialogue = {
    id: 'example-dialogue',
    title: 'Example: The Mysterious Stranger',
    startNodeId: 'start',
    nodes: {
        'start': {
            id: 'start',
            type: 'npc',
            speaker: 'Stranger',
            x: 300,
            y: 100,
            content: "You find yourself at a crossroads. A cloaked figure emerges from the shadows.",
            nextNodeId: 'greeting',
            setFlags: [
                'dialogue_met_stranger'
            ] // Dialogue flag - temporary
        },
        'greeting': {
            id: 'greeting',
            type: 'npc',
            speaker: 'Stranger',
            x: 300,
            y: 200,
            content: "\"Traveler... I've been waiting for you. What brings you to these lands?\"",
            nextNodeId: 'first_choice'
        },
        'first_choice': {
            id: 'first_choice',
            type: 'player',
            content: '',
            x: 300,
            y: 300,
            choices: [
                {
                    id: 'choice_treasure',
                    text: "I seek the legendary treasure.",
                    nextNodeId: 'treasure_response',
                    setFlags: [
                        'quest_dragon_slayer'
                    ] // Quest flag - persistent
                },
                {
                    id: 'choice_knowledge',
                    text: "I'm searching for ancient knowledge.",
                    nextNodeId: 'knowledge_response',
                    setFlags: [
                        'dialogue_seeks_knowledge'
                    ] // Dialogue flag - temporary
                },
                {
                    id: 'choice_hostile',
                    text: "That's none of your business.",
                    nextNodeId: 'hostile_response',
                    setFlags: [
                        'dialogue_hostile'
                    ] // Dialogue flag - temporary
                }
            ]
        },
        'treasure_response': {
            id: 'treasure_response',
            type: 'npc',
            speaker: 'Stranger',
            x: 100,
            y: 450,
            content: "\"Many have sought the same. Take this map—it shows the entrance to the catacombs.\"",
            setFlags: [
                'item_ancient_key'
            ],
            nextNodeId: 'second_choice'
        },
        'knowledge_response': {
            id: 'knowledge_response',
            type: 'npc',
            speaker: 'Stranger',
            x: 300,
            y: 450,
            content: "\"A seeker of truth... Take this tome. It contains the riddles you must solve.\"",
            setFlags: [
                'item_ancient_key'
            ],
            nextNodeId: 'second_choice'
        },
        'hostile_response': {
            id: 'hostile_response',
            type: 'npc',
            speaker: 'Stranger',
            x: 500,
            y: 450,
            content: "\"Very well. Walk your path alone.\"",
            nextNodeId: 'hostile_choice'
        },
        'hostile_choice': {
            id: 'hostile_choice',
            type: 'player',
            content: '',
            x: 500,
            y: 600,
            choices: [
                {
                    id: 'apologize',
                    text: "Wait—I apologize. These roads have made me wary.",
                    nextNodeId: 'apology_response'
                },
                {
                    id: 'leave',
                    text: "I don't need your help. *walk away*",
                    nextNodeId: 'leave_ending'
                }
            ]
        },
        'apology_response': {
            id: 'apology_response',
            type: 'npc',
            speaker: 'Stranger',
            x: 400,
            y: 750,
            content: "\"Humility... perhaps there is hope for you yet. Tell me, what do you truly seek?\"",
            nextNodeId: 'first_choice'
        },
        'leave_ending': {
            id: 'leave_ending',
            type: 'npc',
            speaker: 'Narrator',
            x: 600,
            y: 750,
            content: "You turn and walk away into the mist. Whatever secrets they held are lost to you now.\n\n— END —"
        },
        'second_choice': {
            id: 'second_choice',
            type: 'player',
            content: '',
            x: 200,
            y: 600,
            choices: [
                {
                    id: 'ask_danger',
                    text: "What dangers await me on this path?",
                    nextNodeId: 'danger_info'
                },
                {
                    id: 'ask_stranger',
                    text: "Who are you? Why do you help travelers?",
                    nextNodeId: 'stranger_reveal'
                },
                {
                    id: 'thank_leave',
                    text: "Thank you. I should be on my way.",
                    nextNodeId: 'depart_response'
                }
            ]
        },
        'danger_info': {
            id: 'danger_info',
            type: 'npc',
            speaker: 'Stranger',
            x: 50,
            y: 800,
            content: "\"The forest is home to creatures that fear no blade. Beyond it, the ruins are patrolled by the Hollow.\"",
            nextNodeId: 'final_choice'
        },
        'stranger_reveal': {
            id: 'stranger_reveal',
            type: 'npc',
            speaker: 'Stranger',
            x: 200,
            y: 800,
            content: "The stranger pulls back their hood, revealing an ageless face marked with glowing runes. \"I am the last of the Keepers.\"",
            setFlags: [
                'achievement_first_quest',
                'stat_reputation'
            ],
            nextNodeId: 'final_choice'
        },
        'depart_response': {
            id: 'depart_response',
            type: 'npc',
            speaker: 'Stranger',
            x: 300,
            y: 800,
            content: "\"May the old gods watch over you, traveler.\"\n\n— TO BE CONTINUED —"
        },
        'final_choice': {
            id: 'final_choice',
            type: 'player',
            content: '',
            x: 125,
            y: 950,
            choices: [
                {
                    id: 'ready',
                    text: "I'm ready. Point me to the path.",
                    nextNodeId: 'depart_response'
                },
                {
                    id: 'more_questions',
                    text: "I have more questions...",
                    nextNodeId: 'second_choice'
                }
            ]
        }
    }
};
function DialogueForgePage() {
    const [dialogueTree, setDialogueTree] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultDialogue);
    const [flagSchema, setFlagSchema] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(exampleFlagSchema);
    const [showFlagManager, setShowFlagManager] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentNodeId, setCurrentNodeId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultDialogue.startNodeId);
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('graph');
    const [selectedNodeId, setSelectedNodeId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedNodeIds, setSelectedNodeIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selectionBox, setSelectionBox] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSelecting, setIsSelecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Undo/Redo system - simple snapshot-based approach
    const [history, setHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [historyIndex, setHistoryIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(-1);
    const maxHistorySize = 50;
    const isUndoRedoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Reset history when dialogue tree changes externally (e.g., loading example)
    const resetHistory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((newState)=>{
        const snapshot = JSON.parse(JSON.stringify(newState));
        setHistory([
            snapshot
        ]);
        setHistoryIndex(0);
        isUndoRedoRef.current = false;
    }, []);
    // Save snapshot before making changes
    const saveSnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((state)=>{
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }
        setHistory((prev)=>{
            const currentIndex = historyIndex;
            // Remove any "future" history if we're not at the end
            const trimmedHistory = prev.slice(0, currentIndex + 1);
            // Add new snapshot
            const snapshot = JSON.parse(JSON.stringify(state));
            const newHistory = [
                ...trimmedHistory,
                snapshot
            ];
            // Limit history size
            if (newHistory.length > maxHistorySize) {
                const limited = newHistory.slice(-maxHistorySize);
                setHistoryIndex(maxHistorySize - 1);
                return limited;
            }
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
        });
    }, [
        historyIndex,
        maxHistorySize
    ]);
    // Wrapper for setDialogueTree that tracks history
    const updateDialogueTree = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((updater)=>{
        setDialogueTree((prev)=>{
            // Save snapshot BEFORE making changes
            saveSnapshot(prev);
            // Apply the update
            return updater(prev);
        });
        setHasChanges(true);
    }, [
        saveSnapshot
    ]);
    // Undo function
    const handleUndo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (history.length === 0 || historyIndex <= 0) {
            return;
        }
        isUndoRedoRef.current = true;
        const newIndex = historyIndex - 1;
        const snapshot = JSON.parse(JSON.stringify(history[newIndex]));
        setHistoryIndex(newIndex);
        setDialogueTree(snapshot);
        setHasChanges(true);
    }, [
        history,
        historyIndex
    ]);
    // Redo function
    const handleRedo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (history.length === 0 || historyIndex >= history.length - 1) {
            return;
        }
        isUndoRedoRef.current = true;
        const newIndex = historyIndex + 1;
        const snapshot = JSON.parse(JSON.stringify(history[newIndex]));
        setHistoryIndex(newIndex);
        setDialogueTree(snapshot);
        setHasChanges(true);
    }, [
        history,
        historyIndex
    ]);
    const [saved, setSaved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasChanges, setHasChanges] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [graphOffset, setGraphOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 150,
        y: 30
    });
    const [graphScale, setGraphScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.85);
    const [isPanning, setIsPanning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [contextMenu, setContextMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [nodeContextMenu, setNodeContextMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [draggingEdge, setDraggingEdge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [edgeDropMenu, setEdgeDropMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const skipNextClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [draggingNodeId, setDraggingNodeId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showGuide, setShowGuide] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [layoutStrategy, setLayoutStrategy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('dagre');
    const availableLayouts = listLayouts();
    const panStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0
    });
    const dragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: 0,
        y: 0,
        nodeX: 0,
        nodeY: 0
    });
    const graphRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const flagFileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load from localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const loadedDialogue = JSON.parse(stored);
                resetHistory(loadedDialogue);
                setDialogueTree(loadedDialogue);
            } catch (e) {
                console.error('Failed to load:', e);
            }
        }
        const storedFlags = localStorage.getItem(FLAG_SCHEMA_KEY);
        if (storedFlags) {
            try {
                setFlagSchema(JSON.parse(storedFlags));
            } catch (e) {
                console.error('Failed to load flags:', e);
            }
        }
    }, []);
    // PlayView now handles its own state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log('edgeDropMenu state changed:', edgeDropMenu);
    }, [
        edgeDropMenu
    ]);
    // Keyboard shortcuts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyDown = (e)=>{
            // Delete selected nodes
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.size > 0 && viewMode === 'graph') {
                e.preventDefault();
                updateDialogueTree((prev)=>{
                    const newNodes = {
                        ...prev.nodes
                    };
                    selectedNodeIds.forEach((id)=>{
                        if (id !== prev.startNodeId) {
                            delete newNodes[id];
                            // Remove references
                            Object.keys(newNodes).forEach((nodeId)=>{
                                const node = newNodes[nodeId];
                                if (node.nextNodeId === id) {
                                    newNodes[nodeId] = {
                                        ...node,
                                        nextNodeId: undefined
                                    };
                                }
                                if (node.choices) {
                                    newNodes[nodeId] = {
                                        ...node,
                                        choices: node.choices.map((c)=>c.nextNodeId === id ? {
                                                ...c,
                                                nextNodeId: ''
                                            } : c)
                                    };
                                }
                            });
                        }
                    });
                    return {
                        ...prev,
                        nodes: newNodes
                    };
                });
                setSelectedNodeIds(new Set());
                setSelectedNodeId(null);
            }
            // Select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && viewMode === 'graph') {
                e.preventDefault();
                setSelectedNodeIds(new Set(Object.keys(dialogueTree.nodes)));
            }
            // Undo - Platform specific: Cmd+Z on Mac, Ctrl+Z on Windows/Linux
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            if (modKey && e.key === 'z' && !e.shiftKey && viewMode === 'graph') {
                e.preventDefault();
                handleUndo();
            }
            // Redo - Platform specific: Cmd+Shift+Z on Mac, Ctrl+Y or Ctrl+Shift+Z on Windows/Linux
            if (modKey && (e.key === 'y' || e.key === 'z' && e.shiftKey) && viewMode === 'graph') {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return ()=>window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedNodeIds,
        viewMode,
        dialogueTree,
        handleUndo,
        handleRedo
    ]);
    // Mouse handlers for graph
    const handleGraphMouseDown = (e)=>{
        if (e.button === 2) return; // Right click handled separately
        if (e.target.closest('.graph-node')) return;
        if (e.target.closest('.context-menu')) return;
        // Don't start panning if we're dragging an edge
        if (draggingEdge) return;
        setContextMenu(null);
        // Start selection box if holding Ctrl/Cmd (not Shift, as Shift is for adding to selection)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            const rect = graphRef.current?.getBoundingClientRect();
            if (rect) {
                const graphX = (e.clientX - rect.left - graphOffset.x) / graphScale;
                const graphY = (e.clientY - rect.top - graphOffset.y) / graphScale;
                setIsSelecting(true);
                setSelectionBox({
                    startX: graphX,
                    startY: graphY,
                    endX: graphX,
                    endY: graphY
                });
                // Clear current selection when starting new selection box
                setSelectedNodeIds(new Set());
                setSelectedNodeId(null);
            }
            return;
        }
        // Only clear edge drop menu on explicit clicks, not on mousedown during edge drag release
        if (!edgeDropMenu) {
            setIsPanning(true);
            panStart.current = {
                x: e.clientX - graphOffset.x,
                y: e.clientY - graphOffset.y
            };
        }
    };
    const handleGraphClick = (e)=>{
        // Skip this click if it came from edge drop
        if (skipNextClick.current) {
            skipNextClick.current = false;
            return;
        }
        if (e.target.closest('.graph-node')) return;
        if (e.target.closest('.context-menu')) return;
        // Clear menus on click
        setEdgeDropMenu(null);
        setContextMenu(null);
        setNodeContextMenu(null);
        setSelectedNodeId(null);
    };
    const handleGraphContextMenu = (e)=>{
        e.preventDefault();
        const rect = graphRef.current?.getBoundingClientRect();
        if (!rect) return;
        const graphX = (e.clientX - rect.left - graphOffset.x) / graphScale;
        const graphY = (e.clientY - rect.top - graphOffset.y) / graphScale;
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            graphX,
            graphY
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleMouseMove = (e)=>{
            if (isPanning) {
                setGraphOffset({
                    x: e.clientX - panStart.current.x,
                    y: e.clientY - panStart.current.y
                });
            }
            if (draggingNodeId) {
                const dx = (e.clientX - dragStart.current.x) / graphScale;
                const dy = (e.clientY - dragStart.current.y) / graphScale;
                // Update position without saving to history (will save on mouseup)
                setDialogueTree((prev)=>({
                        ...prev,
                        nodes: {
                            ...prev.nodes,
                            [draggingNodeId]: {
                                ...prev.nodes[draggingNodeId],
                                x: dragStart.current.nodeX + dx,
                                y: dragStart.current.nodeY + dy
                            }
                        }
                    }));
            }
            if (draggingEdge) {
                const rect = graphRef.current?.getBoundingClientRect();
                if (rect) {
                    setDraggingEdge((prev)=>prev ? {
                            ...prev,
                            endX: (e.clientX - rect.left - graphOffset.x) / graphScale,
                            endY: (e.clientY - rect.top - graphOffset.y) / graphScale
                        } : null);
                }
            }
            // Update selection box
            if (isSelecting && selectionBox) {
                const rect = graphRef.current?.getBoundingClientRect();
                if (rect) {
                    const graphX = (e.clientX - rect.left - graphOffset.x) / graphScale;
                    const graphY = (e.clientY - rect.top - graphOffset.y) / graphScale;
                    setSelectionBox((prev)=>prev ? {
                            ...prev,
                            endX: graphX,
                            endY: graphY
                        } : null);
                    // Update selected nodes based on selection box
                    const minX = Math.min(selectionBox.startX, graphX);
                    const maxX = Math.max(selectionBox.startX, graphX);
                    const minY = Math.min(selectionBox.startY, graphY);
                    const maxY = Math.max(selectionBox.startY, graphY);
                    const nodesInBox = Object.values(dialogueTree.nodes).filter((node)=>{
                        const nodeRight = node.x + NODE_WIDTH;
                        const nodeBottom = node.y + NODE_HEIGHT;
                        return node.x < maxX && nodeRight > minX && node.y < maxY && nodeBottom > minY;
                    });
                    setSelectedNodeIds(new Set(nodesInBox.map((n)=>n.id)));
                }
            }
        };
        const handleMouseUp = (e)=>{
            // Save node position to history when drag ends (only if position changed)
            if (draggingNodeId) {
                const node = dialogueTree.nodes[draggingNodeId];
                if (node) {
                    // Check if position actually changed from initial
                    const initialX = dragStart.current.nodeX;
                    const initialY = dragStart.current.nodeY;
                    if (node.x !== initialX || node.y !== initialY) {
                        // Position changed, save current state to history
                        saveSnapshot(dialogueTree);
                    }
                }
                setDraggingNodeId(null);
            }
            // End selection box
            if (isSelecting) {
                setIsSelecting(false);
                setSelectionBox(null);
            }
            // Handle edge drop first, before clearing other states
            if (draggingEdge) {
                const rect = graphRef.current?.getBoundingClientRect();
                if (rect) {
                    const dropX = (e.clientX - rect.left - graphOffset.x) / graphScale;
                    const dropY = (e.clientY - rect.top - graphOffset.y) / graphScale;
                    // Find node at drop position
                    const targetNode = Object.values(dialogueTree.nodes).find((n)=>dropX >= n.x && dropX <= n.x + NODE_WIDTH && dropY >= n.y && dropY <= n.y + NODE_HEIGHT);
                    if (targetNode && targetNode.id !== draggingEdge.fromNodeId) {
                        // Connect to existing node
                        if (draggingEdge.fromChoiceIdx !== undefined) {
                            const fromNode = dialogueTree.nodes[draggingEdge.fromNodeId];
                            if (fromNode.choices) {
                                const newChoices = [
                                    ...fromNode.choices
                                ];
                                newChoices[draggingEdge.fromChoiceIdx] = {
                                    ...newChoices[draggingEdge.fromChoiceIdx],
                                    nextNodeId: targetNode.id
                                };
                                updateDialogueTree((prev)=>({
                                        ...prev,
                                        nodes: {
                                            ...prev.nodes,
                                            [draggingEdge.fromNodeId]: {
                                                ...fromNode,
                                                choices: newChoices
                                            }
                                        }
                                    }));
                            }
                        } else {
                            updateDialogueTree((prev)=>({
                                    ...prev,
                                    nodes: {
                                        ...prev.nodes,
                                        [draggingEdge.fromNodeId]: {
                                            ...prev.nodes[draggingEdge.fromNodeId],
                                            nextNodeId: targetNode.id
                                        }
                                    }
                                }));
                        }
                        setHasChanges(true);
                        setDraggingEdge(null);
                    } else {
                        // Dropped on empty space - show menu to create new node
                        console.log('showing edge drop menu at', e.clientX, e.clientY);
                        skipNextClick.current = true;
                        setEdgeDropMenu({
                            x: e.clientX,
                            y: e.clientY,
                            graphX: dropX,
                            graphY: dropY,
                            fromNodeId: draggingEdge.fromNodeId,
                            fromChoiceIdx: draggingEdge.fromChoiceIdx
                        });
                        setDraggingEdge(null);
                    }
                } else {
                    console.log('no rect');
                    setDraggingEdge(null);
                }
                return; // Don't process further after handling edge
            }
            setIsPanning(false);
            setDraggingNodeId(null);
        };
        const handleKeyDown = (e)=>{
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && viewMode === 'graph') {
                // Don't delete if we're typing in an input
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                if (selectedNodeId !== dialogueTree.startNodeId) {
                    deleteNode(selectedNodeId);
                }
            }
            if (e.key === 'Escape') {
                setContextMenu(null);
                setEdgeDropMenu(null);
                setSelectedNodeId(null);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('keydown', handleKeyDown);
        return ()=>{
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        isPanning,
        draggingNodeId,
        draggingEdge,
        graphOffset,
        graphScale,
        dialogueTree.nodes,
        selectedNodeId,
        viewMode,
        dialogueTree.startNodeId
    ]);
    const handleWheel = (e)=>{
        e.preventDefault();
        setGraphScale((s)=>Math.min(2, Math.max(0.3, s * (e.deltaY > 0 ? 0.9 : 1.1))));
    };
    const handleZoomIn = ()=>{
        setGraphScale((s)=>Math.min(2, s * 1.2));
    };
    const handleZoomOut = ()=>{
        setGraphScale((s)=>Math.max(0.3, s * 0.8));
    };
    const handleZoomFit = ()=>{
        const nodes = Object.values(dialogueTree.nodes);
        if (nodes.length === 0) {
            setGraphOffset({
                x: 150,
                y: 30
            });
            setGraphScale(0.85);
            return;
        }
        const xs = nodes.map((n)=>n.x);
        const ys = nodes.map((n)=>n.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs.map((x)=>x + NODE_WIDTH));
        const maxY = Math.max(...ys.map((y)=>y + NODE_HEIGHT));
        const width = maxX - minX;
        const height = maxY - minY;
        const graphRect = graphRef.current?.getBoundingClientRect();
        if (!graphRect) return;
        const scaleX = (graphRect.width - 100) / width;
        const scaleY = (graphRect.height - 100) / height;
        const scale = Math.min(scaleX, scaleY, 1.5) * 0.9;
        setGraphScale(scale);
        setGraphOffset({
            x: -minX * scale + 50,
            y: -minY * scale + 50
        });
    };
    const selectedNode = selectedNodeId ? dialogueTree.nodes[selectedNodeId] : null;
    const handleSave = ()=>{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dialogueTree));
        localStorage.setItem(FLAG_SCHEMA_KEY, JSON.stringify(flagSchema));
        setSaved(true);
        setHasChanges(false);
        setTimeout(()=>setSaved(false), 2000);
    };
    const updateNode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((nodeId, updates)=>{
        console.log('[UpdateNode] Updating node:', nodeId, 'Updates:', Object.keys(updates));
        updateDialogueTree((prev)=>({
                ...prev,
                nodes: {
                    ...prev.nodes,
                    [nodeId]: {
                        ...prev.nodes[nodeId],
                        ...updates
                    }
                }
            }));
    }, [
        updateDialogueTree
    ]);
    const addNode = (type, x, y)=>{
        const newId = `${type}_${Date.now()}`;
        const newNode = {
            id: newId,
            type,
            content: type === 'npc' ? 'New dialogue...' : '',
            speaker: type === 'npc' ? 'Character' : undefined,
            choices: type === 'player' ? [
                {
                    id: `c_${Date.now()}`,
                    text: 'Choice 1',
                    nextNodeId: ''
                }
            ] : undefined,
            x,
            y
        };
        updateDialogueTree((prev)=>({
                ...prev,
                nodes: {
                    ...prev.nodes,
                    [newId]: newNode
                }
            }));
        setSelectedNodeId(newId);
        setContextMenu(null);
        return newId;
    };
    const addNodeAndConnect = (type, x, y, fromNodeId, fromChoiceIdx)=>{
        const newId = addNode(type, x, y);
        // Connect the new node
        if (fromChoiceIdx !== undefined) {
            const fromNode = dialogueTree.nodes[fromNodeId];
            if (fromNode?.choices) {
                const newChoices = [
                    ...fromNode.choices
                ];
                newChoices[fromChoiceIdx] = {
                    ...newChoices[fromChoiceIdx],
                    nextNodeId: newId
                };
                updateDialogueTree((prev)=>({
                        ...prev,
                        nodes: {
                            ...prev.nodes,
                            [newId]: {
                                ...prev.nodes[newId]
                            },
                            [fromNodeId]: {
                                ...prev.nodes[fromNodeId],
                                choices: newChoices
                            }
                        }
                    }));
            }
        } else {
            updateDialogueTree((prev)=>({
                    ...prev,
                    nodes: {
                        ...prev.nodes,
                        [fromNodeId]: {
                            ...prev.nodes[fromNodeId],
                            nextNodeId: newId
                        }
                    }
                }));
        }
        setEdgeDropMenu(null);
    };
    const deleteNode = (nodeId)=>{
        if (nodeId === dialogueTree.startNodeId) {
            alert("Can't delete the start node!");
            return;
        }
        console.log('[DeleteNode] Deleting node:', nodeId, 'Current nodes:', Object.keys(dialogueTree.nodes));
        updateDialogueTree((prev)=>{
            const { [nodeId]: _, ...rest } = prev.nodes;
            console.log('[DeleteNode] After delete, nodes:', Object.keys(rest));
            // Also remove references to this node
            Object.keys(rest).forEach((id)=>{
                if (rest[id].nextNodeId === nodeId) {
                    rest[id] = {
                        ...rest[id],
                        nextNodeId: undefined
                    };
                }
                if (rest[id].choices) {
                    rest[id] = {
                        ...rest[id],
                        choices: rest[id].choices.map((c)=>c.nextNodeId === nodeId ? {
                                ...c,
                                nextNodeId: ''
                            } : c)
                    };
                }
            });
            return {
                ...prev,
                nodes: rest
            };
        });
        setSelectedNodeId(null);
    };
    const addChoice = (nodeId)=>{
        const node = dialogueTree.nodes[nodeId];
        updateNode(nodeId, {
            choices: [
                ...node.choices || [],
                {
                    id: `c_${Date.now()}`,
                    text: 'New choice...',
                    nextNodeId: ''
                }
            ]
        });
    };
    const updateChoice = (nodeId, idx, updates)=>{
        const node = dialogueTree.nodes[nodeId];
        if (!node.choices) return;
        const newChoices = [
            ...node.choices
        ];
        newChoices[idx] = {
            ...newChoices[idx],
            ...updates
        };
        updateNode(nodeId, {
            choices: newChoices
        });
    };
    const deleteChoice = (nodeId, idx)=>{
        const node = dialogueTree.nodes[nodeId];
        if (!node.choices || node.choices.length <= 1) return;
        updateNode(nodeId, {
            choices: node.choices.filter((_, i)=>i !== idx)
        });
    };
    const handleExportYarn = ()=>{
        const yarn = exportToYarn(dialogueTree);
        const blob = new Blob([
            yarn
        ], {
            type: 'text/plain'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dialogueTree.title.replace(/\s+/g, '_')}.yarn`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleExportJSON = ()=>{
        const json = JSON.stringify(dialogueTree, null, 2);
        const blob = new Blob([
            json
        ], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dialogueTree.title.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleExportFlags = ()=>{
        const json = JSON.stringify(flagSchema, null, 2);
        const blob = new Blob([
            json
        ], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flag-schema.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleImportFlags = (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{
            const content = ev.target?.result;
            try {
                const imported = JSON.parse(content);
                setFlagSchema(imported);
                setHasChanges(true);
            } catch (err) {
                alert('Failed to import flag schema');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    const handleImport = (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{
            const content = ev.target?.result;
            try {
                if (file.name.endsWith('.yarn')) {
                    const dialogue = importFromYarn(content);
                    resetHistory(dialogue);
                    setDialogueTree(dialogue);
                } else {
                    const dialogue = JSON.parse(content);
                    resetHistory(dialogue);
                    setDialogueTree(dialogue);
                }
                setHasChanges(true);
            } catch (err) {
                console.error('Import error:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                alert(`Failed to import file: ${errorMessage}`);
            }
        };
        reader.onerror = ()=>{
            alert('Failed to read file');
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    const startEdgeDrag = (nodeId, choiceIdx)=>{
        console.log('startEdgeDrag', nodeId, choiceIdx);
        const node = dialogueTree.nodes[nodeId];
        const startX = node.x + NODE_WIDTH / 2;
        const startY = node.y + NODE_HEIGHT + (choiceIdx !== undefined ? 20 + choiceIdx * 24 : 0);
        setDraggingEdge({
            fromNodeId: nodeId,
            fromChoiceIdx: choiceIdx,
            startX,
            startY,
            endX: startX,
            endY: startY + 50
        });
    };
    const startNodeDrag = (nodeId, e)=>{
        e.stopPropagation();
        const node = dialogueTree.nodes[nodeId];
        setDraggingNodeId(nodeId);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            nodeX: node.x,
            nodeY: node.y
        };
    };
    // Render connections
    const renderConnections = ()=>{
        const lines = [];
        Object.values(dialogueTree.nodes).forEach((node)=>{
            const fromX = node.x + NODE_WIDTH / 2;
            const fromY = node.y + NODE_HEIGHT;
            if (node.type === 'npc' && node.nextNodeId && dialogueTree.nodes[node.nextNodeId]) {
                const target = dialogueTree.nodes[node.nextNodeId];
                const toX = target.x + NODE_WIDTH / 2;
                const toY = target.y;
                const midY = (fromY + toY) / 2;
                lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                    d: `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`,
                    fill: "none",
                    stroke: "#4a4a6a",
                    strokeWidth: "2",
                    markerEnd: "url(#arrow)"
                }, `${node.id}-next`, false, {
                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                    lineNumber: 871,
                    columnNumber: 11
                }, this));
            }
            if (node.choices) {
                const colors = [
                    '#e94560',
                    '#8b5cf6',
                    '#06b6d4',
                    '#22c55e',
                    '#f59e0b'
                ];
                node.choices.forEach((choice, idx)=>{
                    if (choice.nextNodeId && dialogueTree.nodes[choice.nextNodeId]) {
                        const target = dialogueTree.nodes[choice.nextNodeId];
                        const cFromY = fromY + 10 + idx * 24;
                        const toX = target.x + NODE_WIDTH / 2;
                        const toY = target.y;
                        const midY = (cFromY + toY) / 2;
                        const color = colors[idx % colors.length];
                        lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            d: `M ${fromX} ${cFromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`,
                            fill: "none",
                            stroke: color,
                            strokeWidth: "2",
                            opacity: "0.7",
                            markerEnd: `url(#arrow-${idx})`
                        }, `${node.id}-choice-${idx}`, false, {
                            fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                            lineNumber: 894,
                            columnNumber: 15
                        }, this));
                    }
                });
            }
        });
        // Dragging edge preview
        if (draggingEdge) {
            const midY = (draggingEdge.startY + draggingEdge.endY) / 2;
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: `M ${draggingEdge.startX} ${draggingEdge.startY} C ${draggingEdge.startX} ${midY}, ${draggingEdge.endX} ${midY}, ${draggingEdge.endX} ${draggingEdge.endY}`,
                fill: "none",
                stroke: "#e94560",
                strokeWidth: "2",
                strokeDasharray: "5,5"
            }, "dragging", false, {
                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                lineNumber: 913,
                columnNumber: 9
            }, this));
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: "absolute inset-0 pointer-events-none",
            style: {
                overflow: 'visible'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("marker", {
                            id: "arrow",
                            markerWidth: "10",
                            markerHeight: "7",
                            refX: "9",
                            refY: "3.5",
                            orient: "auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                points: "0 0, 10 3.5, 0 7",
                                fill: "#4a4a6a"
                            }, void 0, false, {
                                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                lineNumber: 928,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                            lineNumber: 927,
                            columnNumber: 11
                        }, this),
                        [
                            '#e94560',
                            '#8b5cf6',
                            '#06b6d4',
                            '#22c55e',
                            '#f59e0b'
                        ].map((color, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("marker", {
                                id: `arrow-${i}`,
                                markerWidth: "10",
                                markerHeight: "7",
                                refX: "9",
                                refY: "3.5",
                                orient: "auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                    points: "0 0, 10 3.5, 0 7",
                                    fill: color
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 932,
                                    columnNumber: 15
                                }, this)
                            }, i, false, {
                                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                lineNumber: 931,
                                columnNumber: 13
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                    lineNumber: 926,
                    columnNumber: 9
                }, this),
                lines
            ]
        }, void 0, true, {
            fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
            lineNumber: 925,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full h-full bg-[#0a0a0f] flex flex-col overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-[#1a1a2e] bg-[#0d0d14]/90 backdrop-blur-sm sticky top-0 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-4 py-2 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/projects/dialogue-forge-interactive-narrative-builder",
                                    className: "text-gray-400 hover:text-white",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                        lineNumber: 948,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 947,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: dialogueTree.title,
                                    onChange: (e)=>{
                                        updateDialogueTree((prev)=>({
                                                ...prev,
                                                title: e.target.value
                                            }));
                                    },
                                    className: "bg-transparent text-white font-semibold text-lg outline-none border-b border-transparent hover:border-[#2a2a3e] focus:border-[#e94560]"
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 950,
                                    columnNumber: 13
                                }, this),
                                hasChanges && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-yellow-500",
                                    children: "•"
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 956,
                                    columnNumber: 28
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                            lineNumber: 946,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1 bg-[#1a1a2e] rounded-lg p-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setViewMode('graph'),
                                    className: `px-3 py-1 text-sm rounded flex items-center gap-1 ${viewMode === 'graph' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`,
                                    title: "Graph Editor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                        lineNumber: 961,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 960,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setViewMode('yarn'),
                                    className: `px-3 py-1 text-sm rounded flex items-center gap-1 ${viewMode === 'yarn' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`,
                                    title: "Yarn Script",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Code$3e$__["Code"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                        lineNumber: 964,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 963,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setViewMode('play'),
                                    className: `px-3 py-1 text-sm rounded flex items-center gap-1 ${viewMode === 'play' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`,
                                    title: "Play Test",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                        lineNumber: 967,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                                    lineNumber: 966,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                            lineNumber: 959,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-1"
                        }, void 0, false, {
                            fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                            lineNumber: 971,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                    lineNumber: 945,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                lineNumber: 944,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex overflow-hidden",
                style: {
                    height: 'calc(100vh - 60px)'
                },
                children: [
                    viewMode === 'graph' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogueEditorV2, {
                        dialogue: dialogueTree,
                        onChange: (updated)=>{
                            updateDialogueTree(()=>updated);
                        },
                        onExportYarn: handleExportYarn,
                        flagSchema: flagSchema,
                        initialViewMode: "graph",
                        layoutStrategy: layoutStrategy,
                        onLayoutStrategyChange: setLayoutStrategy,
                        onOpenFlagManager: ()=>setShowFlagManager(true),
                        onOpenGuide: ()=>setShowGuide(true),
                        onLoadExampleDialogue: (dialogue)=>{
                            resetHistory(dialogue);
                            setDialogueTree(dialogue);
                            setHasChanges(true);
                        },
                        onLoadExampleFlags: (flags)=>{
                            setFlagSchema(flags);
                            setHasChanges(true);
                        },
                        className: "w-full h-full"
                    }, void 0, false, {
                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                        lineNumber: 980,
                        columnNumber: 11
                    }, this),
                    viewMode === 'yarn' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogueEditorV2, {
                        dialogue: dialogueTree,
                        onChange: (updated)=>{
                            updateDialogueTree(()=>updated);
                        },
                        onExportYarn: handleExportYarn,
                        flagSchema: flagSchema,
                        initialViewMode: "yarn",
                        className: "w-full h-full"
                    }, void 0, false, {
                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                        lineNumber: 1008,
                        columnNumber: 11
                    }, this),
                    viewMode === 'play' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogueEditorV2, {
                        dialogue: dialogueTree,
                        onChange: (updated)=>{
                            updateDialogueTree(()=>updated);
                        },
                        flagSchema: flagSchema,
                        initialViewMode: "play",
                        className: "w-full h-full"
                    }, void 0, false, {
                        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                        lineNumber: 1022,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                lineNumber: 977,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GuidePanel, {
                isOpen: showGuide,
                onClose: ()=>setShowGuide(false)
            }, void 0, false, {
                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                lineNumber: 1035,
                columnNumber: 7
            }, this),
            showFlagManager && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FlagManager, {
                flagSchema: flagSchema,
                dialogue: dialogueTree,
                onUpdate: (updated)=>{
                    setFlagSchema(updated);
                    setHasChanges(true);
                },
                onClose: ()=>setShowFlagManager(false)
            }, void 0, false, {
                fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
                lineNumber: 1039,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/portfolio/app/dialogue-forge/page.tsx",
        lineNumber: 942,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.559.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowLeft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m12 19-7-7 7-7",
            key: "1l729n"
        }
    ],
    [
        "path",
        {
            d: "M19 12H5",
            key: "x3x0zl"
        }
    ]
];
const ArrowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-left", __iconNode);
;
 //# sourceMappingURL=arrow-left.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowLeft",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.559.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>GitBranch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "line",
        {
            x1: "6",
            x2: "6",
            y1: "3",
            y2: "15",
            key: "17qcm7"
        }
    ],
    [
        "circle",
        {
            cx: "18",
            cy: "6",
            r: "3",
            key: "1h7g24"
        }
    ],
    [
        "circle",
        {
            cx: "6",
            cy: "18",
            r: "3",
            key: "fqmcym"
        }
    ],
    [
        "path",
        {
            d: "M18 9a9 9 0 0 1-9 9",
            key: "n2h4wq"
        }
    ]
];
const GitBranch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("git-branch", __iconNode);
;
 //# sourceMappingURL=git-branch.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-ssr] (ecmascript) <export default as GitBranch>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GitBranch",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.559.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Play
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
            key: "10ikf1"
        }
    ]
];
const Play = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("play", __iconNode);
;
 //# sourceMappingURL=play.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Play",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.559.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Code
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m16 18 6-6-6-6",
            key: "eg8j8"
        }
    ],
    [
        "path",
        {
            d: "m8 6-6 6 6 6",
            key: "ppft3o"
        }
    ]
];
const Code = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("code", __iconNode);
;
 //# sourceMappingURL=code.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-ssr] (ecmascript) <export default as Code>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Code",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$code$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/code.js [app-ssr] (ecmascript)");
}),
];

//# sourceMappingURL=_e3b80fe8._.js.map