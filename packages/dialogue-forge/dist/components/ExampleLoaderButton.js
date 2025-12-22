"use strict";
/**
 * ExampleLoaderButton - Compact button for loading examples
 *
 * Debug tool for loading example dialogues and flag schemas.
 * Only shown when ENABLE_DEBUG_TOOLS is true.
 */
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
exports.ExampleLoaderButton = ExampleLoaderButton;
const react_1 = __importStar(require("react"));
const examples_1 = require("../examples");
const lucide_react_1 = require("lucide-react");
function ExampleLoaderButton({ onLoadDialogue, onLoadFlags }) {
    const [showMenu, setShowMenu] = (0, react_1.useState)(false);
    const handleDialogueChange = (name) => {
        const dialogue = (0, examples_1.getExampleDialogue)(name);
        if (dialogue) {
            onLoadDialogue(dialogue);
            setShowMenu(false);
        }
    };
    const handleFlagsChange = (name) => {
        const flags = (0, examples_1.getDemoFlagSchema)(name);
        if (flags) {
            onLoadFlags(flags);
            setShowMenu(false);
        }
    };
    return (react_1.default.createElement("div", { className: "relative" },
        react_1.default.createElement("button", { onClick: () => setShowMenu(!showMenu), className: `p-1.5 rounded transition-colors ${showMenu
                ? 'bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/50'
                : 'bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:text-white hover:border-[#3a3a4e]'}`, title: "Load Examples (Debug Tool)" },
            react_1.default.createElement(lucide_react_1.FileCode, { size: 14 })),
        showMenu && (react_1.default.createElement("div", { className: "absolute left-full ml-2 top-0 z-50 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg shadow-xl p-1 min-w-[250px]" },
            react_1.default.createElement("div", { className: "text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 border-b border-[#2a2a3e]" }, "Load Examples"),
            react_1.default.createElement("div", { className: "px-2 py-1" },
                react_1.default.createElement("div", { className: "text-xs text-gray-400 mb-1" }, "Dialogue Examples"),
                react_1.default.createElement("select", { onChange: (e) => {
                        if (e.target.value)
                            handleDialogueChange(e.target.value);
                    }, defaultValue: "", className: "w-full bg-[#12121a] border border-[#2a2a3e] text-white text-xs px-2 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer" },
                    react_1.default.createElement("option", { value: "" }, "Select dialogue..."),
                    (0, examples_1.listExamples)().map(name => {
                        const dialogue = (0, examples_1.getExampleDialogue)(name);
                        if (!dialogue)
                            return null;
                        const nodeCount = Object.keys(dialogue.nodes).length;
                        return (react_1.default.createElement("option", { key: name, value: name },
                            dialogue.title,
                            " (",
                            nodeCount,
                            " nodes)"));
                    }).filter(Boolean))),
            react_1.default.createElement("div", { className: "px-2 py-1 border-t border-[#2a2a3e]" },
                react_1.default.createElement("div", { className: "text-xs text-gray-400 mb-1" }, "Flag Schemas"),
                react_1.default.createElement("select", { onChange: (e) => {
                        if (e.target.value)
                            handleFlagsChange(e.target.value);
                    }, defaultValue: "", className: "w-full bg-[#12121a] border border-[#2a2a3e] text-white text-xs px-2 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer" },
                    react_1.default.createElement("option", { value: "" }, "Select schema..."),
                    (0, examples_1.listDemoFlagSchemas)().map(name => {
                        const flags = (0, examples_1.getDemoFlagSchema)(name);
                        return (react_1.default.createElement("option", { key: name, value: name },
                            name.charAt(0).toUpperCase() + name.slice(1),
                            " (",
                            flags?.flags.length || 0,
                            " flags)"));
                    })))))));
}
