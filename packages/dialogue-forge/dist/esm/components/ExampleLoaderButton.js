/**
 * ExampleLoaderButton - Compact button for loading examples
 *
 * Debug tool for loading example dialogues and flag schemas.
 * Only shown when ENABLE_DEBUG_TOOLS is true.
 */
import React, { useState } from 'react';
import { listExamples, listDemoFlagSchemas, getExampleDialogue, getDemoFlagSchema } from '../examples';
import { FileCode } from 'lucide-react';
export function ExampleLoaderButton({ onLoadDialogue, onLoadFlags }) {
    const [showMenu, setShowMenu] = useState(false);
    const handleDialogueChange = (name) => {
        const dialogue = getExampleDialogue(name);
        if (dialogue) {
            onLoadDialogue(dialogue);
            setShowMenu(false);
        }
    };
    const handleFlagsChange = (name) => {
        const flags = getDemoFlagSchema(name);
        if (flags) {
            onLoadFlags(flags);
            setShowMenu(false);
        }
    };
    return (React.createElement("div", { className: "relative" },
        React.createElement("button", { onClick: () => setShowMenu(!showMenu), className: `p-1.5 rounded transition-colors ${showMenu
                ? 'bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/50'
                : 'bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:text-white hover:border-[#3a3a4e]'}`, title: "Load Examples (Debug Tool)" },
            React.createElement(FileCode, { size: 14 })),
        showMenu && (React.createElement("div", { className: "absolute left-full ml-2 top-0 z-50 bg-[#0d0d14] border border-[#2a2a3e] rounded-lg shadow-xl p-1 min-w-[250px]" },
            React.createElement("div", { className: "text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 border-b border-[#2a2a3e]" }, "Load Examples"),
            React.createElement("div", { className: "px-2 py-1" },
                React.createElement("div", { className: "text-xs text-gray-400 mb-1" }, "Dialogue Examples"),
                React.createElement("select", { onChange: (e) => {
                        if (e.target.value)
                            handleDialogueChange(e.target.value);
                    }, defaultValue: "", className: "w-full bg-[#12121a] border border-[#2a2a3e] text-white text-xs px-2 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer" },
                    React.createElement("option", { value: "" }, "Select dialogue..."),
                    listExamples().map(name => {
                        const dialogue = getExampleDialogue(name);
                        if (!dialogue)
                            return null;
                        const nodeCount = Object.keys(dialogue.nodes).length;
                        return (React.createElement("option", { key: name, value: name },
                            dialogue.title,
                            " (",
                            nodeCount,
                            " nodes)"));
                    }).filter(Boolean))),
            React.createElement("div", { className: "px-2 py-1 border-t border-[#2a2a3e]" },
                React.createElement("div", { className: "text-xs text-gray-400 mb-1" }, "Flag Schemas"),
                React.createElement("select", { onChange: (e) => {
                        if (e.target.value)
                            handleFlagsChange(e.target.value);
                    }, defaultValue: "", className: "w-full bg-[#12121a] border border-[#2a2a3e] text-white text-xs px-2 py-1.5 rounded hover:border-[#3a3a4e] focus:outline-none focus:border-[#e94560] cursor-pointer" },
                    React.createElement("option", { value: "" }, "Select schema..."),
                    listDemoFlagSchemas().map(name => {
                        const flags = getDemoFlagSchema(name);
                        return (React.createElement("option", { key: name, value: name },
                            name.charAt(0).toUpperCase() + name.slice(1),
                            " (",
                            flags?.flags.length || 0,
                            " flags)"));
                    })))))));
}
